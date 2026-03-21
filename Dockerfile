# 使用 Node.js 20 官方镜像
FROM node:20-alpine

WORKDIR /app

# 安装基础依赖
# 如果国内下载慢，可以启用下面的淘宝镜像源
# RUN npm config set registry https://registry.npmmirror.com

# 暴露 Next.js 默认端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev"]