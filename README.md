# WTFMI Alignment Editor

WTFMI map alignment data를 브라우저에서 편집하고 GitHub 저장소에 동기화하는 독립 도구입니다.

## GitHub 동기화

- 불러오기는 공개 저장소의 `data/alignment-state.json`을 사용합니다.
- 저장하려면 `Gen7920335/wtfmi-alignment-editor` 저장소에만 접근 가능한 fine-grained token을 만드세요.
- 토큰 권한은 **Repository permissions → Contents: Read and write**만 필요합니다.
- 토큰은 브라우저 `sessionStorage`에만 보관되며 탭을 닫으면 제거됩니다.
- GitHub에 저장할 때 전체 정합 프로젝트와 사용자 사각형 구역이 하나의 JSON 커밋으로 갱신됩니다.

GitHub Pages: `https://gen7920335.github.io/wtfmi-alignment-editor/`
