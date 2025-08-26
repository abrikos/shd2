import { execSync } from 'child_process';

export default defineEventHandler(async (event) => {
    return execSync(`git log -n 1 --format='%s -- %cd' --date=format-local:'%Y-%m-%d %H:%M:%S'`);
})