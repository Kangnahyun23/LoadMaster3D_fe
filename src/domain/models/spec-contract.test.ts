import { expectTypeOf, test } from 'vitest'
import type {
  CargoPackage,
  FragilityLevel,
  OptimizationRequest,
  OptimizationResult,
  OrientationCode,
  PackagePlacement,
  UnplacedPackage,
  VehicleAxle,
  VehicleConfig,
  VehicleObstacle,
} from '@/domain/models'

/**
 * Chép nguyên văn khối type của Spec mục 6 — nguồn đối chiếu độc lập với schema zod.
 * Kiểm ở lúc biên dịch: `pnpm build` chạy `tsc -b` trên cả file test, lệch một trường là build đỏ.
 */
declare namespace Spec {
  export type OrientationCode =
    | "LWH" | "LHW" | "WLH"
    | "WHL" | "HLW" | "HWL";

  export type FragilityLevel =
    | "NONE" | "LOW" | "MEDIUM" | "HIGH";

  export interface VehicleConfig {
    id: string;
    name: string;
    innerLengthCm: number;
    innerWidthCm: number;
    innerHeightCm: number;
    maxPayloadKg: number;
    doorWidthCm: number;
    doorHeightCm: number;
    doorPosition: "REAR";
    clearanceCm: number;
    floorMaxLoadKg?: number;
    floorPressureLimitKgPerCm2?: number;
    obstacles: VehicleObstacle[];
    axles?: VehicleAxle[];
  }

  export interface VehicleObstacle {
    id: string;
    type: "WHEEL_ARCH" | "COOLING_UNIT" |
          "PARTITION" | "RESERVED_ZONE";
    xCm: number;
    yCm: number;
    zCm: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    loadBearing: boolean;
    maxTopLoadKg?: number;
  }

  export interface VehicleAxle {
    id: string;
    name: string;
    positionXCm: number;
    emptyLoadKg: number;
    maxLoadKg: number;
  }

  export interface CargoPackage {
    id: string;
    name: string;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    weightKg: number;
    quantity: number;
    allowedOrientations: OrientationCode[];
    keepUpright: boolean;
    fragilityLevel: FragilityLevel;
    stackable: boolean;
    maxTopLoadKg: number;
    maxStackCount?: number;
    minSupportRatio: number;
    deliveryStop: number;
    priority: number;
    mustLoad: boolean;
    groupId?: string;
    notes?: string;
  }

  export interface PackagePlacement {
    packageInstanceId: string;
    orientation: OrientationCode;
    xCm: number;
    yCm: number;
    zCm: number;
    placedLengthCm: number;
    placedWidthCm: number;
    placedHeightCm: number;
    loadingOrder: number;
    unloadingOrder: number;
    supportRatio: number;
    constraintWarnings: string[];
  }

  export interface UnplacedPackage {
    packageInstanceId: string;
    reasonCode:
      | "NO_SPACE"
      | "OVER_PAYLOAD"
      | "DOOR_TOO_SMALL"
      | "NO_ALLOWED_ORIENTATION"
      | "STACKING_VIOLATION"
      | "LIFO_VIOLATION"
      | "UNKNOWN";
    message: string;
  }

  export interface OptimizationRequest {
    vehicle: VehicleConfig;
    packages: CargoPackage[];
    settings: {
      method: "MOCK" | "EP_DBLF" | "GA" |
              "SA" | "BBMP_DCS_PQNET";
      timeLimitSeconds: number;
      randomSeed?: number;
      enforceLifo: boolean;
      prioritizeLowCenterOfGravity: boolean;
    };
  }

  export interface OptimizationResult {
    jobId: string;
    status: "COMPLETED" | "FAILED";
    method: string;
    isMockResult: boolean;
    placements: PackagePlacement[];
    unplacedPackages: UnplacedPackage[];
    metrics: {
      totalVehicleVolumeCm3: number;
      usedVolumeCm3: number;
      volumeUtilizationPercent: number;
      maxPayloadKg: number;
      usedPayloadKg: number;
      payloadUtilizationPercent: number;
      placedCount: number;
      unplacedCount: number;
      centerOfGravityCm?: {
        x: number;
        y: number;
        z: number;
      };
      runtimeMs: number;
    };
  }
}

test('the model types are exactly the Spec §6 contract: same fields, same optionality, nothing extra (D-04)', () => {
  expectTypeOf<OrientationCode>().toEqualTypeOf<Spec.OrientationCode>()
  expectTypeOf<FragilityLevel>().toEqualTypeOf<Spec.FragilityLevel>()
  expectTypeOf<VehicleConfig>().toEqualTypeOf<Spec.VehicleConfig>()
  expectTypeOf<VehicleObstacle>().toEqualTypeOf<Spec.VehicleObstacle>()
  expectTypeOf<VehicleAxle>().toEqualTypeOf<Spec.VehicleAxle>()
  expectTypeOf<CargoPackage>().toEqualTypeOf<Spec.CargoPackage>()
  expectTypeOf<PackagePlacement>().toEqualTypeOf<Spec.PackagePlacement>()
  expectTypeOf<UnplacedPackage>().toEqualTypeOf<Spec.UnplacedPackage>()
  expectTypeOf<OptimizationRequest>().toEqualTypeOf<Spec.OptimizationRequest>()
  expectTypeOf<OptimizationResult>().toEqualTypeOf<Spec.OptimizationResult>()
})
