import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const aliases = {
    'jspdf': resolve(__dirname, 'src/lib/jspdf.umd.min.js'),
    'jspdf-autotable': resolve(__dirname, 'src/lib/jspdf.plugin.autotable.min.js')
  };

  // Library build configuration (externalize jspdf)
  if (mode === 'lib') {
    return {
      resolve: {
        alias: aliases
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'DrawPDF',
          fileName: 'drawpdf'
        },
        outDir: 'dist',
        rollupOptions: {
          external: ['jspdf', 'jspdf-autotable'],
          output: {
            globals: {
              jspdf: 'jspdf',
              'jspdf-autotable': 'jspdfAutoTable'
            }
          }
        }
      }
    };
  }

  // Standalone build - bundle everything including jspdf
  if (mode === 'standalone') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.full.js'),
          name: 'DrawPDF',
          fileName: 'drawpdf.standalone',
          formats: ['umd']
        },
        outDir: 'dist',
        emptyOutDir: false, // Don't delete other dist files
        rollupOptions: {
          // Don't externalize anything - bundle all dependencies
          output: {
            globals: {}
          }
        }
      }
    };
  }

  // Full Bundle (ESM) - bundle everything for convenient import
  if (mode === 'full') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.full.js'),
          name: 'DrawPDF',
          fileName: 'drawpdf.full',
          formats: ['es']
        },
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
          // Bundle everything
          external: []
        }
      }
    };
  }

  // Default dev/app configuration
  return {
    root: ".",
    base: "./",
    resolve: {
      alias: aliases
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'DrawPDF',
        fileName: 'drawpdf'
      },
      outDir: "dist",
      rollupOptions: {
        external: ['jspdf', 'jspdf-autotable'],
        output: {
          globals: {
            jspdf: 'jspdf',
            'jspdf-autotable': 'jspdfAutoTable'
          }
        }
      }
    },
  };
});
