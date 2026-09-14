/**
 * Ánh sáng ba nguồn: bán cầu cho nền tối, đèn chính chếch trên phải
 * (đổ bóng khi thiết bị đủ mạnh), đèn phụ chéo ngược để mặt khuất không đen.
 * Gốc toạ độ thế giới là tâm thùng xe nên đèn chỉ cần trỏ về (0,0,0).
 */
import { readToken } from '@/lib/tokens'

export function SceneLighting({ shadows }: { shadows: boolean }) {
  return (
    <>
      <hemisphereLight args={[readToken('--bg'), readToken('--canvas-1'), 0.95]} />
      <directionalLight
        position={[3, 12, 4]}
        intensity={1.9}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-5, 5, -6]} intensity={0.45} />
    </>
  )
}
