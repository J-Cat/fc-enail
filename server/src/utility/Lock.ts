export class Lock {
  public locked = false;
  private onRelease: (() => void)[] = [];
  
  public acquire = () => {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        return resolve();
      }
  
      const tryAcquire = () => {
        if (!this.locked) {
          this.locked = true;
          return resolve();
        }
      }
  
      this.onRelease.push(tryAcquire);
    });
  }
  
  public release = () => {
    this.locked = false;
    let release = this.onRelease.pop();
    while (release) {
      release();
      if (this.onRelease.length > 0) {
        release = this.onRelease.pop();        
      } else {
        release = undefined;
      }
    }
  }
}
