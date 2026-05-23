const MOJIBAKE_START = '[\\u00c3\\u00c2\\u00e2\\u00f0]';
const MOJIBAKE_CONTINUE = '[\\u0080-\\u00ff\\u2018-\\u201d\\u2020-\\u2026\\u2030\\u20ac\\u2122]';
const MOJIBAKE_RE = new RegExp(`${MOJIBAKE_START}${MOJIBAKE_CONTINUE}*`);
const MOJIBAKE_SEQUENCE_RE = new RegExp(`${MOJIBAKE_START}${MOJIBAKE_CONTINUE}+`, 'g');

const WINDOWS_1252_BYTES: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function cp1252Byte(char: string) {
  const code = char.charCodeAt(0);
  if (code <= 0xff) return code;
  return WINDOWS_1252_BYTES[code] ?? null;
}

function repairMojibake(value: string) {
  if (!MOJIBAKE_RE.test(value)) return value;

  try {
    const bytes: number[] = [];
    for (const char of value) {
      const byte = cp1252Byte(char);
      if (byte === null) return value;
      bytes.push(byte);
    }
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    return repaired.includes('\uFFFD') ? value : repaired;
  } catch {
    return value;
  }
}

function repairTextNode(node: Text) {
  const original = node.nodeValue || '';
  if (!MOJIBAKE_RE.test(original)) return;

  const repaired = original.replace(MOJIBAKE_SEQUENCE_RE, repairMojibake);
  if (repaired !== original) node.nodeValue = repaired;
}

function walkTextNodes(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    repairTextNode(root as Text);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    repairTextNode(node as Text);
    node = walker.nextNode();
  }
}

export function installTextRepair() {
  if (typeof window === 'undefined' || !document.body) return;

  walkTextNodes(document.body);

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        walkTextNodes(node);
      }
      if (mutation.type === 'characterData') {
        repairTextNode(mutation.target as Text);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}
