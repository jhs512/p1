// scripts/upload.ts
/**
 *   시리즈 전체:  pnpm upload 001/KOR
 *   단일 에피소드: pnpm upload 001/KOR/003
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";
import type { youtube_v3 } from "googleapis";

import { getYouTubeClient } from "./youtube-auth";

const SRC_DIR = "src/compositions";
const OUT_DIR = "out";
const arg = process.argv[2];

if (!arg || !arg.includes("/")) {
  console.error("Usage: pnpm upload <series>/<lang> 또는 <series>/<lang>/<episode>");
  process.exit(1);
}

// ── 인자 파싱 ───────────────────────────────────────────────
const parts = arg.split("/");
const seriesArg = parts[0];
const langDir = parts[1]; // KOR, ENG, ...
const singleEpisode = parts[2] ?? null; // null이면 전체

type PrivacyStatus = "private" | "public" | "unlisted";

// ── 유틸 함수 ───────────────────────────────────────────────

/** 재생목록에서 모든 영상 제목 조회 */
async function getPlaylistVideos(
  yt: youtube_v3.Youtube,
  playlistId: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>(); // title → videoId
  let pageToken: string | undefined;
  do {
    const res = await yt.playlistItems.list({
      part: ["snippet"],
      playlistId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items ?? []) {
      const title = item.snippet?.title ?? "";
      const videoId = item.snippet?.resourceId?.videoId ?? "";
      if (title && videoId) map.set(title, videoId);
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  return map;
}

/** 재생목록 생성 또는 기존 ID 반환 */
async function ensurePlaylist(
  yt: youtube_v3.Youtube,
  title: string,
  description: string,
): Promise<string> {
  // 내 재생목록 검색 (페이지네이션)
  let pageToken: string | undefined;
  let existing: { id?: string | null } | undefined;
  do {
    const res = await yt.playlists.list({
      part: ["snippet"],
      mine: true,
      maxResults: 50,
      pageToken,
    });
    existing = res.data.items?.find((p) => p.snippet?.title === title);
    if (existing) break;
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);
  if (existing?.id) {
    console.log(`📋  재생목록 발견: "${title}" (${existing.id})`);
    return existing.id;
  }

  // 생성
  const created = await yt.playlists.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title, description },
      status: { privacyStatus: "public" },
    },
  });
  const id = created.data.id!;
  console.log(`📋  재생목록 생성: "${title}" (${id})`);
  console.log(`⚠️  YouTube Studio에서 이 재생목록을 '공식 시리즈'로 설정해주세요.`);
  return id;
}

/** 영상 업로드 */
async function uploadVideo(
  yt: youtube_v3.Youtube,
  videoPath: string,
  meta: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    privacyStatus: PrivacyStatus;
    language: string;
  },
): Promise<string> {
  console.log(`⬆️  업로드 중: "${meta.title}"`);
  const res = await yt.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: meta.title,
        description: meta.description,
        tags: meta.tags,
        categoryId: meta.categoryId,
        defaultLanguage: meta.language,
        defaultAudioLanguage: meta.language,
      },
      status: {
        privacyStatus: meta.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: { body: createReadStream(videoPath) },
  });
  const videoId = res.data.id!;
  console.log(`   ✅  업로드 완료: https://youtu.be/${videoId}`);
  return videoId;
}

/** 썸네일 업로드 */
async function uploadThumbnail(
  yt: youtube_v3.Youtube,
  videoId: string,
  thumbPath: string,
): Promise<void> {
  await yt.thumbnails.set({
    videoId,
    media: { body: createReadStream(thumbPath) },
  });
  console.log(`   🖼️  썸네일 설정 완료`);
}

/** 자막 업로드 */
async function uploadCaption(
  yt: youtube_v3.Youtube,
  videoId: string,
  srtPath: string,
  language: string,
): Promise<void> {
  await yt.captions.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        videoId,
        language,
        name: language === "ko" ? "한국어" : language,
      },
    },
    media: { body: createReadStream(srtPath) },
  });
  console.log(`   📝  자막 업로드 완료 (${language})`);
}

/** 재생목록에 영상 추가 */
async function addToPlaylist(
  yt: youtube_v3.Youtube,
  playlistId: string,
  videoId: string,
): Promise<void> {
  await yt.playlistItems.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    },
  });
  console.log(`   📋  재생목록에 추가 완료`);
}

// ── 메인 ────────────────────────────────────────────────────
(async () => {
  // 1. 시리즈 폴더 찾기
  const seriesDirs = readdirSync(SRC_DIR)
    .filter((d) => statSync(path.join(SRC_DIR, d)).isDirectory())
    .sort();

  const seriesDir =
    seriesDirs.find((d) => d === seriesArg) ??
    seriesDirs.find((d) => d.startsWith(seriesArg));
  if (!seriesDir) {
    console.error(`❌  시리즈 "${seriesArg}" 를 찾을 수 없습니다.`);
    process.exit(1);
  }

  // 2. youtube.ts 로드
  const ytConfigPath = path.resolve(SRC_DIR, seriesDir, langDir, "youtube.ts");
  const { YOUTUBE_CONFIG } = await import(ytConfigPath);

  // 3. 에피소드 목록 (정렬)
  const episodeKeys = Object.keys(YOUTUBE_CONFIG.episodes).sort();
  const targets = singleEpisode
    ? episodeKeys.filter((k: string) => k === singleEpisode)
    : episodeKeys;

  if (targets.length === 0) {
    console.error("❌  업로드할 에피소드가 없습니다.");
    process.exit(1);
  }

  // 4. YouTube 인증
  console.log(`\n🔐  YouTube 인증 중…`);
  const yt = await getYouTubeClient();

  // 5. 재생목록 확보
  const playlistId = await ensurePlaylist(
    yt,
    YOUTUBE_CONFIG.playlist.title,
    YOUTUBE_CONFIG.playlist.description,
  );

  // 6. 기존 영상 목록 조회 (중복 체크)
  const existingVideos = await getPlaylistVideos(yt, playlistId);

  // 7. 썸네일용 Remotion 번들 (필요 시)
  let bundled: string | null = null;
  let uploaded = 0;

  // 8. 에피소드별 처리
  for (const ep of targets) {
    const epConfig = YOUTUBE_CONFIG.episodes[ep as keyof typeof YOUTUBE_CONFIG.episodes];
    const title = epConfig.title;

    // 중복 체크
    if (existingVideos.has(title)) {
      console.log(`⏭️  "${title}" — 이미 재생목록에 존재, 스킵`);
      continue;
    }

    const defaults = YOUTUBE_CONFIG.defaults;
    const meta = {
      title,
      description: "description" in epConfig ? (epConfig as any).description : "",
      tags: "tags" in epConfig ? (epConfig as any).tags : [...defaults.tags],
      categoryId:
        "categoryId" in epConfig ? (epConfig as any).categoryId : defaults.categoryId,
      privacyStatus: (
        "privacyStatus" in epConfig
          ? (epConfig as any).privacyStatus
          : defaults.privacyStatus
      ) as PrivacyStatus,
      language: defaults.language,
    };

    const mp4Path = path.join(OUT_DIR, seriesDir, `${ep}.mp4`);
    const srtPath = path.join(OUT_DIR, seriesDir, `${ep}.srt`);

    // mp4 없으면 스킵
    if (!existsSync(mp4Path)) {
      console.warn(`⚠️  ${mp4Path} 없음, 스킵 (pnpm render 먼저 실행)`);
      continue;
    }

    // 썸네일 렌더링
    if (!bundled) {
      console.log(`\n🎬  Remotion 번들링 (썸네일용)…`);
      bundled = await bundle({
        entryPoint: path.resolve("src/index.ts"),
        webpackOverride: (c: any) => c,
      });
    }
    const dirPrefix = seriesDir.match(/^(\d+)/)?.[1] ?? "";
    const compositionId = [dirPrefix, langDir, ep].join("-");
    const thumbDir = path.join(OUT_DIR, seriesDir);
    const thumbPath = path.join(thumbDir, `${ep}-thumb.jpeg`);
    mkdirSync(thumbDir, { recursive: true });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionId,
    });
    await renderStill({
      composition,
      serveUrl: bundled,
      output: thumbPath,
      frame: 0,
      imageFormat: "jpeg",
      jpegQuality: 90,
    });
    console.log(`   🖼️  썸네일 렌더링 완료: ${thumbPath}`);

    // 영상 업로드
    const videoId = await uploadVideo(yt, mp4Path, meta);

    // 썸네일 설정
    await uploadThumbnail(yt, videoId, thumbPath);

    // 자막 업로드 (SRT 파일 있을 때만)
    if (existsSync(srtPath)) {
      await uploadCaption(yt, videoId, srtPath, meta.language);
    }

    // 재생목록 추가
    await addToPlaylist(yt, playlistId, videoId);
    uploaded++;
  }

  console.log(`\n🎉  업로드 ${uploaded}개 / 전체 ${targets.length}개 에피소드\n`);
})().catch((err) => {
  console.error("\n❌ ", err.message ?? err);
  process.exit(1);
});
