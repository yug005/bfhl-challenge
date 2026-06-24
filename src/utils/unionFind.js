class UnionFind {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  add(x) {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
  }

  find(x) {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)));
    }
    return this.parent.get(x);
  }

  union(x, y) {
    this.add(x);
    this.add(y);
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return;

    const rankX = this.rank.get(rootX);
    const rankY = this.rank.get(rootY);
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
  }

  getGroups() {
    const groups = new Map();
    for (const node of this.parent.keys()) {
      const root = this.find(node);
      if (!groups.has(root)) {
        groups.set(root, new Set());
      }
      groups.get(root).add(node);
    }
    return groups;
  }
}

module.exports = UnionFind;
