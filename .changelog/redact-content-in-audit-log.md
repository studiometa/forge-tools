### Security

- **Core**: Redact `content` and `script` in the audit log, so `forge env update --content` and `forge_write` env, nginx, PHP config and script updates no longer write their values to disk, and redact every option name that ends with `token`, `password`, `passphrase`, `secret`, `key` or `credential(s)` at any depth (`db-password`, `client_secret`, nested objects), keeping the logged keys
