// src/compositions/003-RGB-Method/KOR/001-1-RGBMethod.tsx
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import React from "react";

import { CROSS, SceneAudio, Subtitle, THUMB_CROSS, uiFont, useFade } from "../../../utils/scene";
import { computeFromValues } from "../../../utils/srt";
import { CONTENT } from "./001-2-content";
import { AUDIO_CONFIG } from "./001-3-audio.gen";
import {
  BG,
  BG_CARD,
  BG_THUMB,
  C_BLUE,
  C_BORDER,
  C_DIM,
  C_GREEN,
  C_HIGHLIGHT,
  C_RED,
  TEXT,
  TEXT_ON_ACCENT,
  TEXT_SECONDARY,
} from "./colors";
import { FPS, HEIGHT, WIDTH } from "./config";

// ── 4K 폰트 스케일 ─────────────────────────────────────────
const F = {
  label: 52,
  heading: 64,
  title: 88,
  display: 112,
  body: 48,
  quote: 72,
} as const;

// ── 4K용 ContentArea ────────────────────────────────────────
const BOTTOM_MARGIN_4K = 250;
const SUBTITLE_DEAD_ZONE_4K = BOTTOM_MARGIN_4K + 120;

const ContentArea4K: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: height - SUBTITLE_DEAD_ZONE_4K, overflow: "visible" }}>
      {children}
    </div>
  );
};

// ── SceneTitle4K ────────────────────────────────────────────
const SceneTitle4K: React.FC<{ title: string; color?: string }> = ({ title, color = TEXT }) => (
  <div style={{ position: "absolute", top: 80, left: 100, fontFamily: uiFont, fontSize: F.heading, fontWeight: 700, color, letterSpacing: 1 }}>
    {title}
  </div>
);

// ── 유틸: narration에서 발음 문법 제거 ──────────────────────
const clean = (s: string) => s.replace(/\[([^\]]*?)\(발음:[^\)]*\)\]/g, "$1").replace(/\n/g, " ");

// ── VIDEO_CONFIG ────────────────────────────────────────────
const sceneKeys = [
  "thumbnail", "hook", "collapse", "why", "reveal", "rgbIntro",
  "rulesWhy", "rulesStructure", "rulesLevels",
  "guard", "build", "loop", "aiRole", "insight", "closing",
] as const;

type SceneKey = (typeof sceneKeys)[number];

const buildCfg = (key: Exclude<SceneKey, "thumbnail">) => ({
  audio: `rgb-${key}.mp3`,
  durationInFrames: AUDIO_CONFIG[key].durationInFrames,
  speechStartFrame: AUDIO_CONFIG[key].speechStartFrame,
  narration: CONTENT[key].narration as string[],
  narrationSplits: AUDIO_CONFIG[key].narrationSplits,
});

export const VIDEO_CONFIG = {
  thumbnail: { durationInFrames: 60 },
  hook: buildCfg("hook"),
  collapse: buildCfg("collapse"),
  why: buildCfg("why"),
  reveal: buildCfg("reveal"),
  rgbIntro: buildCfg("rgbIntro"),
  rulesWhy: buildCfg("rulesWhy"),
  rulesStructure: buildCfg("rulesStructure"),
  rulesLevels: buildCfg("rulesLevels"),
  guard: buildCfg("guard"),
  build: buildCfg("build"),
  loop: buildCfg("loop"),
  aiRole: buildCfg("aiRole"),
  insight: buildCfg("insight"),
  closing: buildCfg("closing"),
} as const;

// ── 씬 목록 & fromValues ────────────────────────────────────
const sceneList = sceneKeys.map((k) => VIDEO_CONFIG[k]);
const fromValues = computeFromValues(
  sceneList.map((s) => s.durationInFrames),
  { cross: CROSS, firstOverlap: THUMB_CROSS },
);
const totalDuration = fromValues[fromValues.length - 1] + sceneList[sceneList.length - 1].durationInFrames;

export const compositionMeta = { fps: FPS, width: WIDTH, height: HEIGHT, durationInFrames: totalDuration };

// ── 공통 훅 ─────────────────────────────────────────────────
const useScene = (key: Exclude<SceneKey, "thumbnail">) => {
  const cfg = VIDEO_CONFIG[key];
  const d = cfg.durationInFrames;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = cfg.speechStartFrame;
  const splits = cfg.narrationSplits ?? [];
  const starts = [s, ...splits];
  return { cfg, d, frame, fps, s, splits, starts };
};

const appearAt = (frame: number, startFrame: number, fps: number, dur = 26) =>
  spring({ frame: frame - startFrame, fps, config: { damping: 13, stiffness: 130 }, durationInFrames: dur });

const scaleFrom = (appear: number, from = 0.9) =>
  interpolate(appear, [0, 1], [from, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const slideUp = (appear: number, px = 30) =>
  interpolate(appear, [0, 1], [px, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ── 씬 컴포넌트 ─────────────────────────────────────────────

// 0. Thumbnail
const ThumbnailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [60 - THUMB_CROSS, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG_THUMB, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40, opacity: fadeOut }}>
      <div style={{ fontFamily: uiFont, fontSize: 52, fontWeight: 700, letterSpacing: 12, display: "flex", gap: 24 }}>
        <span style={{ color: C_RED }}>R</span>
        <span style={{ color: C_GREEN }}>G</span>
        <span style={{ color: C_BLUE }}>B</span>
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 160, fontWeight: 900, lineHeight: 1.1, textAlign: "center", color: "#ffffff" }}>
        RGB
        <br />
        <span style={{ fontSize: 100, fontWeight: 700 }}>개발 방법론</span>
      </div>
      <div style={{ fontFamily: uiFont, fontSize: 48, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
        AI 시대의 삼권분립 코딩
      </div>
    </AbsoluteFill>
  );
};

// 1-3. ACT 1: 고통 (hook, collapse, why) — 다크 배경으로 긴장감
const DarkNarrativeScene: React.FC<{ sceneKey: Exclude<SceneKey, "thumbnail">; title?: string; accent?: string }> = ({ sceneKey, title, accent = C_RED }) => {
  const { cfg, d, frame, fps, starts } = useScene(sceneKey);
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: "#0d0d0d", opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          {title && <SceneTitle4K title={title} color="rgba(255,255,255,0.5)" />}
          <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 2800, display: "flex", flexDirection: "column", gap: 40 }}>
            {cfg.narration.map((sentence, i) => {
              const appear = appearAt(frame, starts[i], fps);
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: uiFont,
                    fontSize: F.quote,
                    fontWeight: 600,
                    color: "#ffffff",
                    lineHeight: 1.7,
                    opacity: appear,
                    transform: `translateY(${slideUp(appear)}px)`,
                    textAlign: "center",
                  }}
                >
                  {clean(sentence)}
                </div>
              );
            })}
          </div>
          {/* 하단 악센트 라인 */}
          <div style={{ position: "absolute", bottom: SUBTITLE_DEAD_ZONE_4K + 20, left: "50%", transform: "translateX(-50%)", width: 200, height: 4, background: accent, borderRadius: 2 }} />
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle
        sentences={cfg.narration}
        splits={cfg.narrationSplits}
        speechStart={cfg.speechStartFrame}
        wordFrames={AUDIO_CONFIG[sceneKey].wordStartFrames}
      />
    </>
  );
};

// 4. Reveal — RGB 등장 (밝은 배경으로 전환)
const RevealScene: React.FC = () => {
  const { cfg, d, frame, fps, s, splits } = useScene("reveal");
  const opacity = useFade(d);

  const titleAppear = appearAt(frame, splits[1] ?? s + 120, fps, 30);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <div style={{ fontFamily: uiFont, fontSize: F.body, fontWeight: 500, color: TEXT_SECONDARY, opacity: appearAt(frame, s, fps), marginBottom: 60 }}>
              {clean(cfg.narration[0])}
            </div>
            <div style={{ fontFamily: uiFont, fontSize: F.body, fontWeight: 500, color: TEXT, opacity: appearAt(frame, splits[0] ?? s + 60, fps), lineHeight: 1.7, marginBottom: 80, maxWidth: 2400 }}>
              {clean(cfg.narration[1])}
            </div>
          </div>

          {/* RGB 큰 글자 */}
          <div
            style={{
              position: "absolute",
              top: "65%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scaleFrom(titleAppear, 0.7)})`,
              display: "flex",
              gap: 60,
              opacity: titleAppear,
            }}
          >
            {[
              { letter: "R", color: C_RED },
              { letter: "G", color: C_GREEN },
              { letter: "B", color: C_BLUE },
            ].map(({ letter, color }) => (
              <div key={letter} style={{ fontFamily: uiFont, fontSize: 200, fontWeight: 900, color }}>
                {letter}
              </div>
            ))}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.reveal.wordStartFrames} />
    </>
  );
};

// 5. RGB Intro — R/G/B 카드 3개
const RGBIntroScene: React.FC = () => {
  const { cfg, d, frame, fps, starts } = useScene("rgbIntro");
  const opacity = useFade(d);

  const cards = [
    { letter: "R", label: "Rules", role: "입법부", desc: "프로젝트의 규칙을 정한다", color: C_RED },
    { letter: "G", label: "Guard", role: "사법부", desc: "규칙이 지켜지는지 감시한다", color: C_GREEN },
    { letter: "B", label: "Build", role: "행정부", desc: "규칙 안에서 코드를 작성한다", color: C_BLUE },
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", gap: 48, width: 3200 }}>
            {cards.map((card, i) => {
              const appear = appearAt(frame, starts[i], fps, 30);
              return (
                <div
                  key={card.letter}
                  style={{
                    flex: 1,
                    background: BG_CARD,
                    borderRadius: 24,
                    padding: "64px 48px",
                    borderTop: `8px solid ${card.color}`,
                    opacity: appear,
                    transform: `scale(${scaleFrom(appear)}) translateY(${slideUp(appear, 40)}px)`,
                    textAlign: "center",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ fontFamily: uiFont, fontSize: 120, fontWeight: 900, color: card.color, marginBottom: 16 }}>
                    {card.letter}
                  </div>
                  <div style={{ fontFamily: uiFont, fontSize: F.heading, fontWeight: 800, color: TEXT, marginBottom: 12 }}>
                    {card.label}
                  </div>
                  <div style={{ fontFamily: uiFont, fontSize: F.label, fontWeight: 600, color: card.color, marginBottom: 24 }}>
                    {card.role}
                  </div>
                  <div style={{ fontFamily: uiFont, fontSize: F.body - 4, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                    {card.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.rgbIntro.wordStartFrames} />
    </>
  );
};

// 6. Rules Why — 타이포 중심 씬
const RulesWhyScene: React.FC = () => {
  const { cfg, d, frame, fps, starts } = useScene("rulesWhy");
  const opacity = useFade(d);

  const lines = [
    { text: "기억은 기준이 아닙니다.", dim: "사람은 기억합니다. 하지만" },
    { text: "직관은 테스트가 아닙니다.", dim: "팀은 직관을 공유합니다. 하지만" },
    { text: "타협이 쌓이면 구조가 무너집니다.", dim: "적히지 않은 상식은 타협됩니다." },
  ];

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", gap: 48, maxWidth: 2800 }}>
            {lines.map((line, i) => {
              const appear = appearAt(frame, starts[i], fps, 30);
              return (
                <div key={i} style={{ opacity: appear, transform: `translateY(${slideUp(appear)}px)`, textAlign: "center" }}>
                  <div style={{ fontFamily: uiFont, fontSize: F.body - 4, color: TEXT_SECONDARY, marginBottom: 8 }}>
                    {line.dim}
                  </div>
                  <div style={{ fontFamily: uiFont, fontSize: F.title, fontWeight: 800, color: TEXT }}>
                    {line.text}
                  </div>
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.rulesWhy.wordStartFrames} />
    </>
  );
};

// 7-8. Rules Structure & Levels — 카드 씬
const BrightCardScene: React.FC<{
  sceneKey: Exclude<SceneKey, "thumbnail">;
  title: string;
  accentColor?: string;
}> = ({ sceneKey, title, accentColor = C_RED }) => {
  const { cfg, d, frame, fps, starts } = useScene(sceneKey);
  const opacity = useFade(d);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title={title} color={accentColor} />
          <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 2800, display: "flex", flexDirection: "column", gap: 28 }}>
            {cfg.narration.map((sentence, i) => {
              const appear = appearAt(frame, starts[i], fps);
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: uiFont,
                    fontSize: F.body,
                    fontWeight: 500,
                    color: TEXT,
                    lineHeight: 1.7,
                    padding: "32px 52px",
                    background: BG_CARD,
                    borderRadius: 16,
                    borderLeft: `6px solid ${accentColor}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    opacity: appear,
                    transform: `translateY(${slideUp(appear, 20)}px)`,
                  }}
                >
                  {clean(sentence)}
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG[sceneKey as keyof typeof AUDIO_CONFIG]?.wordStartFrames} />
    </>
  );
};

// 9-10. Guard & Build — 큰 카드 씬
const BigCardScene: React.FC<{
  sceneKey: "guard" | "build";
  label: string;
  color: string;
}> = ({ sceneKey, label, color }) => {
  const { cfg, d, frame, fps, s, starts } = useScene(sceneKey);
  const opacity = useFade(d);
  const mainAppear = appearAt(frame, s, fps, 30);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${scaleFrom(mainAppear, 0.85)})`,
              width: 2400,
              padding: "80px 100px",
              background: BG_CARD,
              borderRadius: 28,
              borderLeft: `12px solid ${color}`,
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              opacity: mainAppear,
            }}
          >
            <div style={{ fontFamily: uiFont, fontSize: F.display, fontWeight: 900, color, marginBottom: 48 }}>
              {label}
            </div>
            {cfg.narration.map((sentence, i) => {
              const appear = appearAt(frame, starts[i], fps);
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: uiFont,
                    fontSize: F.body,
                    fontWeight: 500,
                    color: TEXT,
                    lineHeight: 1.8,
                    marginBottom: 24,
                    opacity: appear,
                  }}
                >
                  {clean(sentence)}
                </div>
              );
            })}
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG[sceneKey].wordStartFrames} />
    </>
  );
};

// 11. Loop — 순환 다이어그램
const LoopScene: React.FC = () => {
  const { cfg, d, frame, fps, starts } = useScene("loop");
  const opacity = useFade(d);

  const nodes = [
    { label: "Rules", color: C_RED, x: 1920, y: 420 },
    { label: "Guard", color: C_GREEN, x: 2520, y: 980 },
    { label: "Build", color: C_BLUE, x: 1320, y: 980 },
  ];

  // 순환 화살표 위치
  const arrows = [
    { x: 2300, y: 650, rotate: 50 },
    { x: 1920, y: 1120, rotate: 180 },
    { x: 1540, y: 650, rotate: -50 },
  ];

  // 가운데 "반복" 텍스트
  const centerAppear = appearAt(frame, starts[3] ?? starts[starts.length - 1], fps, 30);

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <SceneTitle4K title="반복 루프" />

          {nodes.map((node, i) => {
            const appear = appearAt(frame, starts[Math.min(i + 1, starts.length - 1)], fps, 28);
            return (
              <div
                key={node.label}
                style={{
                  position: "absolute",
                  left: node.x,
                  top: node.y,
                  transform: `translate(-50%, -50%) scale(${scaleFrom(appear, 0.7)})`,
                  width: 340,
                  height: 340,
                  borderRadius: "50%",
                  background: node.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: uiFont,
                  fontSize: F.heading,
                  fontWeight: 800,
                  color: TEXT_ON_ACCENT,
                  opacity: appear,
                  boxShadow: `0 8px 32px ${node.color}44`,
                }}
              >
                {node.label}
              </div>
            );
          })}

          {arrows.map((arrow, i) => {
            const appear = appearAt(frame, starts[Math.min(i + 2, starts.length - 1)], fps);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: arrow.x,
                  top: arrow.y,
                  transform: `translate(-50%, -50%) rotate(${arrow.rotate}deg)`,
                  fontSize: 80,
                  color: TEXT_SECONDARY,
                  opacity: appear,
                }}
              >
                →
              </div>
            );
          })}

          {/* 가운데 순환 텍스트 */}
          <div
            style={{
              position: "absolute",
              left: 1920,
              top: 780,
              transform: "translate(-50%, -50%)",
              fontFamily: uiFont,
              fontSize: F.label,
              fontWeight: 700,
              color: TEXT_SECONDARY,
              opacity: centerAppear,
              textAlign: "center",
            }}
          >
            반복
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.loop.wordStartFrames} />
    </>
  );
};

// 14. Closing — 마지막 씬 (fadeOut 없음)
const ClosingScene: React.FC = () => {
  const cfg = VIDEO_CONFIG.closing;
  const d = cfg.durationInFrames;
  const opacity = useFade(d, { out: false });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 40 });

  return (
    <>
      <AbsoluteFill style={{ background: BG, opacity }}>
        <ContentArea4K>
          <SceneAudio src={cfg.audio} />
          <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", opacity: appear, maxWidth: 2800 }}>
            <div style={{ fontFamily: uiFont, fontSize: 200, color: TEXT_SECONDARY, lineHeight: 0.5, marginBottom: 40 }}>
              "
            </div>
            <div style={{ fontFamily: uiFont, fontSize: F.title, fontWeight: 600, color: TEXT, lineHeight: 1.6 }}>
              좋은 질서를 바라지 말고,
              <br />
              좋은 질서를 가져라.
            </div>
            <div style={{ fontFamily: uiFont, fontSize: F.body, fontWeight: 400, color: TEXT_SECONDARY, marginTop: 60 }}>
              그 질서 안에서, 코드는 스스로 정렬됩니다.
            </div>
          </div>
        </ContentArea4K>
      </AbsoluteFill>
      <Subtitle sentences={cfg.narration} splits={cfg.narrationSplits} speechStart={cfg.speechStartFrame} wordFrames={AUDIO_CONFIG.closing.wordStartFrames} />
    </>
  );
};

// ── 메인 컴포지션 ───────────────────────────────────────────
const scenes: [number, React.ReactNode][] = [
  [0, <ThumbnailScene />],
  [1, <DarkNarrativeScene sceneKey="hook" />],
  [2, <DarkNarrativeScene sceneKey="collapse" accent={C_RED} />],
  [3, <DarkNarrativeScene sceneKey="why" accent={C_HIGHLIGHT} />],
  [4, <RevealScene />],
  [5, <RGBIntroScene />],
  [6, <RulesWhyScene />],
  [7, <BrightCardScene sceneKey="rulesStructure" title="Rules — 구조 vs 스펙" />],
  [8, <BrightCardScene sceneKey="rulesLevels" title="Rules — 헌법 vs 법률" />],
  [9, <BigCardScene sceneKey="guard" label="Guard" color={C_GREEN} />],
  [10, <BigCardScene sceneKey="build" label="Build" color={C_BLUE} />],
  [11, <LoopScene />],
  [12, <BrightCardScene sceneKey="aiRole" title="AI의 역할" accentColor={TEXT_SECONDARY} />],
  [13, <DarkNarrativeScene sceneKey="insight" accent={C_HIGHLIGHT} />],
  [14, <ClosingScene />],
];

const RGBMethod: React.FC = () => (
  <>
    {scenes.map(([i, node]) => (
      <Sequence key={i} from={fromValues[i]} durationInFrames={sceneList[i].durationInFrames}>
        {node}
      </Sequence>
    ))}
  </>
);

export { RGBMethod as Component };
