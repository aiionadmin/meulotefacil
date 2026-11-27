/** IndexedDB — blobs DXF por empreendimento (planta persistida no browser). */

const DB_NAME = "mlf-planta-dxf";
const STORE = "blobs";
const DB_VER = 1;

export type DxfBlobRecord = {
  developmentId: string;
  name: string;
  mime: string;
  updatedAt: string;
  buffer: ArrayBuffer;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponível"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "developmentId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

export async function saveDxfBlob(
  developmentId: string,
  name: string,
  buffer: ArrayBuffer
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({
      developmentId,
      name,
      mime: "application/dxf",
      updatedAt: new Date().toISOString(),
      buffer,
    } satisfies DxfBlobRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB put failed"));
  });
  db.close();
}

export async function loadDxfBlob(
  developmentId: string
): Promise<DxfBlobRecord | null> {
  const db = await openDb();
  const row = await new Promise<DxfBlobRecord | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(developmentId);
    req.onsuccess = () => resolve((req.result as DxfBlobRecord) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
  });
  db.close();
  return row;
}

export async function deleteDxfBlob(developmentId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(developmentId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB delete failed"));
  });
  db.close();
}
