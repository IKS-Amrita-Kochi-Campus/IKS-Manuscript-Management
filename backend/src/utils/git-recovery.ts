/**
 * Git Recovery Script
 * Pulls the latest commit from the repository
 * Used for recovery when issues are detected
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

export async function pullLatestCommit(): Promise<{ success: boolean; message: string; commit?: string }> {
    try {
        console.log('🔄 Pulling latest commit from repository...');

        // Change to project root
        process.chdir(projectRoot);

        // Check if we're in a git repository
        try {
            execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        } catch {
            return {
                success: false,
                message: 'Not a git repository',
            };
        }

        // Check current branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        console.log(`📌 Current branch: ${currentBranch}`);

        // Fetch latest changes
        console.log('📥 Fetching from remote...');
        execSync('git fetch origin', { stdio: 'inherit' });

        // Check if there are updates
        const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        const remoteCommit = execSync(`git rev-parse origin/${currentBranch}`, { encoding: 'utf-8' }).trim();

        if (localCommit === remoteCommit) {
            console.log('✓ Already on the latest commit');
            return {
                success: true,
                message: 'Already on the latest commit',
                commit: localCommit.substring(0, 7),
            };
        }

        // Pull latest changes
        console.log('⬇️  Pulling latest changes...');
        execSync(`git pull origin ${currentBranch}`, { stdio: 'inherit' });

        // Get new commit hash
        const newCommit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
        console.log(`✓ Successfully pulled to commit ${newCommit.substring(0, 7)}`);

        return {
            success: true,
            message: `Successfully pulled latest changes to commit ${newCommit.substring(0, 7)}`,
            commit: newCommit.substring(0, 7),
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('✗ Git recovery failed:', errorMsg);
        return {
            success: false,
            message: `Git recovery failed: ${errorMsg}`,
        };
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    pullLatestCommit().then((result) => {
        console.log('\n' + JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    });
}

export default pullLatestCommit;
