export class Lock {
  private locked = false;
  private onRelease: (() => void) | undefined = undefined;
  
  public acquire = () => {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        return resolve();
      }
  
      const tryAcquire = () => {
        if (!this.locked) {
          this.locked = true;
          this.onRelease = undefined;
          return resolve();
        }
      }
  
      this.onRelease = tryAcquire;
    });
  }
  
  public release = () => {
    this.locked = false;
    if (this.onRelease) {
      this.onRelease();
    }
  }
}
