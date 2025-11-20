// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {}
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {}
//   },
//   build: {
//     rollupOptions: {
//       external: [
//         'firebase/app',
//         'firebase/auth', 
//         'firebase/firestore',
//         'firebase/analytics'
//       ]
//     }
//   },
//   optimizeDeps: {
//     exclude: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics']
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {},
//     global: 'globalThis'
//   },
//   resolve: {
//     dedupe: ['firebase']  // ← ADD THIS LINE
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {},
//     global: 'globalThis'
//   },
//   build: {
//     commonjsOptions: {
//       include: [/firebase/, /node_modules/]
//     }
//   },
//   optimizeDeps: {
//     include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
//   }
// })



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {},
//     global: 'globalThis'
//   },
//   build: {
//     rollupOptions: {
//       external: [
//         'firebase',
//         'firebase/app',
//         'firebase/auth',
//         'firebase/firestore',
//         'firebase/analytics'
//       ]
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  }
})