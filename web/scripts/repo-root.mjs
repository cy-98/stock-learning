import path from 'node:path';

/** 仓库根目录：本地为 web 上一级；Docker 内通过 REPO_ROOT 挂载 */
export function getRepoRoot(webRoot) {
  if (process.env.REPO_ROOT) {
    return path.resolve(process.env.REPO_ROOT);
  }
  return path.resolve(webRoot, '..');
}
