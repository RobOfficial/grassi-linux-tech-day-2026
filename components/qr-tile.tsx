import QRCode from "qrcode";

export async function QrTile({ url, label, size = 240 }: { url: string; label?: string; size?: number }) {
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: size,
    color: { dark: "#39ff7a", light: "#0a1a14" },
    errorCorrectionLevel: "M",
  });
  return (
    <div className="flex flex-col items-center text-center">
      <img src={dataUrl} alt={label ?? "QR"} className="rounded border border-primary/40 bg-[#0a1a14]" width={size} height={size} />
      {label && <p className="mt-2 text-xs text-primary break-all">{label}</p>}
    </div>
  );
}
