import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { loadTsExports, loadMergedConfig } from "./config-cascade";

// ── 임시 fixtures 폴더 ───────────────────────────────────────
const FIXTURES = path.join(process.cwd(), ".test-fixtures");
const COURSE_DIR = path.join(FIXTURES, "test-course");

beforeAll(() => {
  mkdirSync(COURSE_DIR, { recursive: true });

  // 루트 config
  writeFileSync(path.join(FIXTURES, "root.config.ts"),
    `export const FPS = 30;\nexport const VOICE = "root-voice";\nexport const RATE = "+0%";\n`
  );

  // 강좌 config (VOICE, RATE override)
  writeFileSync(path.join(COURSE_DIR, "config.ts"),
    `export const VOICE = "course-voice";\nexport const RATE = "+30%";\n`
  );

  // 에피소드 config (RATE만 override)
  writeFileSync(path.join(COURSE_DIR, "ep001.config.ts"),
    `export const RATE = "+50%";\n`
  );
});

afterAll(() => {
  rmSync(FIXTURES, { recursive: true, force: true });
});

// ── loadTsExports ────────────────────────────────────────────

describe("loadTsExports", () => {
  it("존재하는 ts 파일의 exports를 객체로 반환", () => {
    const result = loadTsExports(path.join(FIXTURES, "root.config.ts"));
    expect(result.FPS).toBe(30);
    expect(result.VOICE).toBe("root-voice");
    expect(result.RATE).toBe("+0%");
  });

  it("존재하지 않는 파일은 빈 객체 반환", () => {
    const result = loadTsExports(path.join(FIXTURES, "nonexistent.ts"));
    expect(result).toEqual({});
  });
});

// ── loadMergedConfig ─────────────────────────────────────────

describe("loadMergedConfig", () => {
  it("루트 → 강좌 순으로 merge: 강좌 값이 루트를 override", () => {
    const cfg = loadMergedConfig(
      COURSE_DIR,
      "ep001",
      path.join(FIXTURES, "root.config.ts"),
    );
    // 강좌 config의 VOICE가 루트를 덮어씀
    expect(cfg.VOICE).toBe("course-voice");
  });

  it("루트에만 있는 값은 그대로 내려옴", () => {
    const cfg = loadMergedConfig(
      COURSE_DIR,
      "ep001",
      path.join(FIXTURES, "root.config.ts"),
    );
    expect(cfg.FPS).toBe(30);
  });

  it("에피소드 config가 강좌 config를 override", () => {
    const cfg = loadMergedConfig(
      COURSE_DIR,
      "ep001",
      path.join(FIXTURES, "root.config.ts"),
    );
    // ep001.config.ts의 RATE가 course config의 RATE를 덮어씀
    expect(cfg.RATE).toBe("+50%");
  });

  it("에피소드 config 없으면 강좌 값 그대로 사용", () => {
    const cfg = loadMergedConfig(
      COURSE_DIR,
      "ep999",  // 존재하지 않는 에피소드
      path.join(FIXTURES, "root.config.ts"),
    );
    expect(cfg.RATE).toBe("+30%");
    expect(cfg.VOICE).toBe("course-voice");
  });

  it("에피소드 config 없어도 루트 값은 내려옴", () => {
    const cfg = loadMergedConfig(
      COURSE_DIR,
      "ep999",
      path.join(FIXTURES, "root.config.ts"),
    );
    expect(cfg.FPS).toBe(30);
  });
});
