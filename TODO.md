# Deployment/Auth Reliability TODO

- [ ] Harden backend CORS handling for Vercel production + preview origins and local dev
- [ ] Make frontend API baseURL production-safe when env var is missing/misconfigured
- [ ] Improve auth register validation/error responses for clearer client failures
- [ ] Run critical-path verification with curl (register + CORS-related behavior)
- [ ] Mark tasks complete after verification
