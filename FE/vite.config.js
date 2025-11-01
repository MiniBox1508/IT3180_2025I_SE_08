import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // Mọi yêu cầu FE gửi đến '/api' sẽ được chuyển tiếp
      // tới server BE tại http://localhost:3000
      '/api': {
        target: 'http://localhost:3000', // Port của BE
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Xóa '/api' khỏi đường dẫn
      }
    }
  }
});
