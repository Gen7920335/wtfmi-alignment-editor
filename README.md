# WTFMI Alignment Editor

WTFMI map alignment data를 브라우저에서 편집하고 GitHub 저장소에 동기화하는 독립 도구입니다.

## GitHub 동기화

- 정합 데이터는 비공개 `Gen7920335/wtfmi-alignment-data` 저장소의 `alignment-state.json`에 보관됩니다.
- 불러오기와 저장에는 이 비공개 저장소 하나에만 접근 가능한 fine-grained token을 사용하세요.
- 토큰 권한은 **Repository permissions → Contents: Read and write**만 필요합니다.
- 토큰은 저장소에 기록하지 않고 현재 페이지 메모리에만 유지되며, 새로고침하면 제거됩니다.
- GitHub에 저장할 때 전체 정합 프로젝트와 사용자 사각형 구역이 하나의 JSON 커밋으로 갱신됩니다.

GitHub Pages: `https://gen7920335.github.io/wtfmi-alignment-editor/`
