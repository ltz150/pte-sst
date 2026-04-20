# PTE SST 高频题库 · litianzeng.cn

飞凡英语 2026年3月版 · 61道核心题目

## 部署步骤

### 1. 推送到 GitHub
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/你的用户名/pte-sst.git
git push -u origin main
```

### 2. Vercel 部署
- 打开 vercel.com，GitHub 登录
- New Project → 导入仓库 → Deploy（自动识别 Next.js）

### 3. 绑定 litianzeng.cn
在 Vercel Settings → Domains 添加域名，然后在域名注册商添加：

| 类型 | 主机记录 | 值 |
|------|---------|-----|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 更新题目
编辑 `data/cards.ts` → git push → Vercel 自动重新部署
