/**
 * Startup Recovery Handler
 * Automatically attempts to pull the latest commit on startup if needed
 */
import pullLatestCommit from './git-recovery.js';
export async function ensureLatestCode() {
    const recoverOnStartup = process.env.AUTO_RECOVERY_ON_STARTUP === 'true';
    if (!recoverOnStartup) {
        console.log('ℹ️  Auto-recovery on startup is disabled');
        return;
    }
    console.log('\n🔍 Checking for latest commit...');
    try {
        const result = await pullLatestCommit();
        if (result.success) {
            console.log(`✓ ${result.message}`);
            // If we pulled new changes, you might want to restart the app
            if (result.message.includes('Successfully pulled')) {
                console.log('\n⚠️  New changes pulled. Please restart the application to apply updates.');
                console.log('💡 Tip: Consider using a process manager like PM2 with auto-restart enabled.');
            }
        }
        else {
            console.log(`⚠️  ${result.message}`);
        }
    }
    catch (error) {
        console.error('✗ Startup recovery check failed:', error);
        // Don't fail startup if recovery check fails
    }
    console.log('');
}
export default ensureLatestCode;
//# sourceMappingURL=startup-recovery.js.map