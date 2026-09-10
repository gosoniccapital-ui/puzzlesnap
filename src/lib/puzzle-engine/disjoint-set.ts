export class DisjointSet {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(i: number): number {
    if (this.parent[i] === i) {
      return i;
    }
    this.parent[i] = this.find(this.parent[i]); // Path compression
    return this.parent[i];
  }

  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI === rootJ) return false;

    // Union by rank
    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI] += 1;
    }

    return true;
  }

  connected(i: number, j: number): boolean {
    return this.find(i) === this.find(j);
  }

  getGroup(i: number): number[] {
    const root = this.find(i);
    const members: number[] = [];
    for (let j = 0; j < this.parent.length; j++) {
      if (this.find(j) === root) {
        members.push(j);
      }
    }
    return members;
  }
}
