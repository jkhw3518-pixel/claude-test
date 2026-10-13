# 📒 전화번호부

Next.js + Supabase로 만든 전화번호 관리 웹사이트입니다. Vercel에 배포합니다.

## 기능

- 이메일/비밀번호 회원가입, 로그인
- 연락처 추가, 수정, 삭제 (이름, 전화번호, 이메일, 그룹, 메모)
- 이름, 번호, 이메일, 메모 검색
- 그룹별 필터, 즐겨찾기
- 전화번호 자동 하이픈 (010-1234-5678, 02-123-4567)
- 번호를 누르면 바로 전화 걸기 (모바일)
- Row Level Security로 각 사용자는 자기 연락처만 볼 수 있음

## 1. Supabase 설정

1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. **SQL Editor**를 열고 `supabase/schema.sql` 내용을 붙여넣어 실행합니다.
3. **Project Settings > API**에서 `Project URL`과 `anon public` 키를 복사합니다.
4. (선택) **Authentication > Providers > Email**에서 `Confirm email`을 끄면 가입 즉시 로그인됩니다.

## 2. 로컬 실행

```bash
cp .env.local.example .env.local   # 복사한 URL과 키를 입력
npm install
npm run dev
```

http://localhost:3000 을 엽니다.

## 3. Vercel 배포

1. 이 폴더를 GitHub 저장소에 push 합니다.
2. https://vercel.com/new 에서 저장소를 import 합니다.
3. **Environment Variables**에 아래 두 값을 넣고 Deploy 합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 배포가 끝나면 Supabase **Authentication > URL Configuration**의 `Site URL`을 Vercel 주소(예: `https://내프로젝트.vercel.app`)로 바꿉니다. 확인 메일 링크가 이 주소로 연결됩니다.

## 파일 구조

```
supabase/schema.sql          테이블, 보안 정책(RLS)
src/lib/supabase.ts          Supabase 클라이언트
src/app/page.tsx             로그인 상태에 따라 화면 전환
src/components/AuthForm.tsx  로그인 / 회원가입
src/components/ContactList.tsx  연락처 목록, 검색, 삭제
src/components/ContactForm.tsx  연락처 추가 / 수정
```
