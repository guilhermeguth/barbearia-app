import AppDataSource from "./data-source";
import { Setting } from "./entities/Setting";

async function checkObsoleteSettings() {
  try {
    await AppDataSource.initialize();

    const settingRepository = AppDataSource.getRepository(Setting);
    const allSettings = await settingRepository.find();

    console.log("=== CONFIGURAÇÕES ATUAIS NO BANCO ===");

    if (allSettings.length === 0) {
      console.log("❌ Nenhuma configuração encontrada no banco");
      return;
    }

    const smtpKeys = [
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass",
      "smtp_secure",
    ];
    const obsoleteSettings: Setting[] = [];
    const validSettings: Setting[] = [];

    allSettings.forEach((setting: Setting) => {
      if (smtpKeys.includes(setting.key)) {
        validSettings.push(setting);
      } else {
        obsoleteSettings.push(setting);
      }
    });

    console.log("\n✅ CONFIGURAÇÕES VÁLIDAS (SMTP):");
    validSettings.forEach((setting: Setting) => {
      const value = setting.isEncrypted ? "***CRIPTOGRAFADO***" : setting.value;
      console.log(`  - ${setting.key}: ${value} (${setting.description})`);
    });

    if (obsoleteSettings.length > 0) {
      console.log("\n⚠️  CONFIGURAÇÕES OBSOLETAS ENCONTRADAS:");
      obsoleteSettings.forEach((setting: Setting) => {
        console.log(
          `  - ${setting.key}: ${setting.value} (${setting.description})`,
        );
      });

      console.log("\n🗑️  Removendo configurações obsoletas...");
      await settingRepository.remove(obsoleteSettings);
      console.log("✅ Configurações obsoletas removidas!");
    } else {
      console.log("\n✅ Nenhuma configuração obsoleta encontrada!");
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkObsoleteSettings();
