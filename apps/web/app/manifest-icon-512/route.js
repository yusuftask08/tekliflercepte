import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c7c67",
          color: "white",
          fontSize: 290,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        T
      </div>
    ),
    { width: 512, height: 512 }
  );
}
