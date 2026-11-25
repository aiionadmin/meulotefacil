/**
 * Flags de demo — npx tsx lib/runtime/demo-mode.test.ts
 */
import {
  isDemoLoginAllowed,
  isDemoToolsAllowed,
  isDevSeedAllowed,
  isProductionRuntime,
} from "./demo-mode";

const prod = isProductionRuntime();

if (prod) {
  if (isDemoLoginAllowed() || isDemoToolsAllowed()) {
    console.error("FALHOU: demo deve estar off em production");
    process.exit(1);
  }
  if (isDevSeedAllowed() && process.env.ALLOW_DEV_SEED !== "1") {
    console.error("FALHOU: seed unificado só com ALLOW_DEV_SEED em prod");
    process.exit(1);
  }
} else {
  if (!isDemoLoginAllowed() || !isDemoToolsAllowed() || !isDevSeedAllowed()) {
    console.error("FALHOU: em development demo/seed devem estar on");
    process.exit(1);
  }
}

console.log("OK demo-mode", { prod });
