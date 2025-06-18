// vite.config.js
import { defineConfig } from "file:///C:/Users/Mitarbeiter/Frappe-LMS-Test/lms/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Mitarbeiter/Frappe-LMS-Test/lms/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import frappeui from "file:///C:/Users/Mitarbeiter/Frappe-LMS-Test/lms/node_modules/frappe-ui/vite/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Mitarbeiter\\Frappe-LMS-Test\\lms\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    frappeui({
      frappeProxy: true,
      lucideIcons: true,
      jinjaBootData: true,
      frappeTypes: {
        input: {}
      },
      buildConfig: {
        indexHtmlPath: "../lms/www/lms.html"
      }
    }),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  server: {
    allowedHosts: ["fs", "per2"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "tailwind.config.js": path.resolve(__vite_injected_original_dirname, "tailwind.config.js")
    }
  },
  optimizeDeps: {
    include: [
      "feather-icons",
      "showdown",
      "engine.io-client",
      "tailwind.config.js",
      "highlight.js",
      "plyr"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNaXRhcmJlaXRlclxcXFxGcmFwcGUtTE1TLVRlc3RcXFxcbG1zXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNaXRhcmJlaXRlclxcXFxGcmFwcGUtTE1TLVRlc3RcXFxcbG1zXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NaXRhcmJlaXRlci9GcmFwcGUtTE1TLVRlc3QvbG1zL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBmcmFwcGV1aSBmcm9tICdmcmFwcGUtdWkvdml0ZSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblx0cGx1Z2luczogW1xyXG5cdFx0ZnJhcHBldWkoe1xyXG5cdFx0XHRmcmFwcGVQcm94eTogdHJ1ZSxcclxuXHRcdFx0bHVjaWRlSWNvbnM6IHRydWUsXHJcblx0XHRcdGppbmphQm9vdERhdGE6IHRydWUsXHJcblx0XHRcdGZyYXBwZVR5cGVzOiB7XHJcblx0XHRcdFx0aW5wdXQ6IHt9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRidWlsZENvbmZpZzoge1xyXG5cdFx0XHRcdGluZGV4SHRtbFBhdGg6ICcuLi9sbXMvd3d3L2xtcy5odG1sJyxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdFx0dnVlKHtcclxuXHRcdFx0c2NyaXB0OiB7XHJcblx0XHRcdFx0ZGVmaW5lTW9kZWw6IHRydWUsXHJcblx0XHRcdFx0cHJvcHNEZXN0cnVjdHVyZTogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdF0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRhbGxvd2VkSG9zdHM6IFsnZnMnLCAncGVyMiddLFxyXG5cdH0sXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0J0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXHJcblx0XHRcdCd0YWlsd2luZC5jb25maWcuanMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAndGFpbHdpbmQuY29uZmlnLmpzJyksXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0b3B0aW1pemVEZXBzOiB7XHJcblx0XHRpbmNsdWRlOiBbXHJcblx0XHRcdCdmZWF0aGVyLWljb25zJyxcclxuXHRcdFx0J3Nob3dkb3duJyxcclxuXHRcdFx0J2VuZ2luZS5pby1jbGllbnQnLFxyXG5cdFx0XHQndGFpbHdpbmQuY29uZmlnLmpzJyxcclxuXHRcdFx0J2hpZ2hsaWdodC5qcycsXHJcblx0XHRcdCdwbHlyJyxcclxuXHRcdF0sXHJcblx0fSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVixTQUFTLG9CQUFvQjtBQUM5VyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sY0FBYztBQUhyQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixTQUFTO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixhQUFhO0FBQUEsTUFDYixlQUFlO0FBQUEsTUFDZixhQUFhO0FBQUEsUUFDWixPQUFPLENBQUM7QUFBQSxNQUNUO0FBQUEsTUFDQSxhQUFhO0FBQUEsUUFDWixlQUFlO0FBQUEsTUFDaEI7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELElBQUk7QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLE1BQ25CO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsY0FBYyxDQUFDLE1BQU0sTUFBTTtBQUFBLEVBQzVCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDbEMsc0JBQXNCLEtBQUssUUFBUSxrQ0FBVyxvQkFBb0I7QUFBQSxJQUNuRTtBQUFBLEVBQ0Q7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNiLFNBQVM7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
