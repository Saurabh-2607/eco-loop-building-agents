dev:
	pnpm --dir apps/web dev

backend:
	cd apps/backend && uvicorn main:app --reload
