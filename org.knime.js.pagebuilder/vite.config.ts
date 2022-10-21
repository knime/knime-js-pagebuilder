import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    compatConfig: {
                        MODE: 3
                    }
                }
            }
        }),
        svgLoader(),
        cssInjectedByJsPlugin() // not supported natively in Vite yet, see https://github.com/vitejs/vite/issues/1579
    ],
    resolve: {
        alias: {
            vue: '@vue/compat',
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@@': fileURLToPath(new URL('.', import.meta.url))
        }
    },
    build: {
        lib: {
            entry: fileURLToPath(new URL('src/lib.js', import.meta.url)),
            name: 'PageBuilder',
            fileName: 'PageBuilder',
            formats: ['es']
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    },
    envPrefix: 'KNIME_'
});
