import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import type { UserConfig, BuildOptions } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const wrapperBuild:BuildOptions = {
        outDir: './dist/app',
        rollupOptions: {
            input: {
                apWrapper: fileURLToPath(new URL('apWrapper.html', import.meta.url))
            }
        }
    };

    const libBuild:BuildOptions = {
        outDir: './dist/lib',
        lib: {
            entry: fileURLToPath(new URL('src/lib.js', import.meta.url)),
            name: 'PageBuilder',
            fileName: 'PageBuilder',
            formats: ['umd']
        },
        rollupOptions: {
            external: ['vue', 'consola'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    };

    const config:UserConfig = {
        base: './',
        plugins: [
            vue(
                /* {
                template: {
                    compilerOptions: {
                        compatConfig: {
                            MODE: 3
                        }
                    }
                }
                } */
            ),
            svgLoader()
        ],
        resolve: {
            alias: {
                // vue: '@vue/compat',
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '@@': fileURLToPath(new URL('.', import.meta.url))
            }
        },
        envPrefix: 'KNIME_'
    };

    if (mode === 'lib') {
        config.plugins?.push(cssInjectedByJsPlugin()); // not supported natively in Vite yet, see https://github.com/vitejs/vite/issues/1579
        config.build = libBuild;
    } else {
        config.build = wrapperBuild;
    }

    return config;
});
