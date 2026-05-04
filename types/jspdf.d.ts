import "jspdf";

declare module "jspdf" {
  interface jsPDF {
    setGState(state: GState): void;
  }

  class GState {
    constructor(options: { opacity?: number; strokeOpacity?: number });
  }
}
