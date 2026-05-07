# RTK Optimizer

**상태:** 활성  
**별칭:** token-saver, context-compressor

## 역할

이 스킬은 RTK(Rust Token Killer)를 OpenClaw/Hermes 토큰 절감 계층에 연결한다. Luna, Star, Solar는 긴 파일과 로그를 그대로 읽기 전에 RTK 요약/검색/압축 경로를 먼저 사용한다.

## 명령

```bash
python3 token_stats.py
python3 -c 'from rtk_wrapper import log_rtk_usage; log_rtk_usage(1000, 800, "test")'
```

권장 공통 진입점:

```bash
rtk stats
rtk read path/to/file
rtk grep "pattern" path
```

## 구현 기준

- RTK 경로는 hardcode하지 않고 `PATH`의 `rtk`를 우선 사용한다.
- `token_stats.py`는 실제 `rtk gain` 결과를 같이 표시한다.
- 긴 문맥 자체를 요약해야 할 때만 압축을 사용하고, Claude/Codex/Gemini로 넘길 때는 짧은 문제 브리프와 필요한 파일 조각만 전달한다.
- Paperclip 체크리스트에는 전체 대화가 아니라 재개에 필요한 결정, 남은 작업, 검증 명령만 남긴다.
