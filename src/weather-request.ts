export class LatestRequestCoordinator {
  private version = 0;

  begin(): number {
    this.version += 1;
    return this.version;
  }

  isCurrent(token: number): boolean {
    return token === this.version;
  }

  runIfCurrent(token: number, callback: () => void): boolean {
    if (!this.isCurrent(token)) { return false; }
    callback();
    return true;
  }

  runErrorIfCurrent(token: number, preserveExisting: boolean, callback: () => void): boolean {
    if (preserveExisting) { return false; }
    return this.runIfCurrent(token, callback);
  }
}
