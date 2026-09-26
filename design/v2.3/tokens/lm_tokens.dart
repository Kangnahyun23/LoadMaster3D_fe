// LoadMaster V2.3 "Cyan kính" — token cho app Flutter (cùng giá trị với tokens/v3.css của web).
// Đặt vào lib/theme/ của repo app. Màu chỉ lấy từ đây, không viết Color(0x…) trong widget.
import 'package:flutter/painting.dart';

abstract final class LmColors {
  // cyan thương hiệu
  static const cyan50 = Color(0xFFE7FCFD);
  static const cyan100 = Color(0xFFCBF7F9);
  static const cyan200 = Color(0xFF9BEDF2);
  static const cyan300 = Color(0xFF5CDBE6);
  static const cyan400 = Color(0xFF00C3D4);
  static const cyan500 = Color(0xFF00A9BB);
  static const cyan600 = Color(0xFF008A9D);
  static const cyan700 = Color(0xFF006F81); // chữ link, vòng focus, ô đã chọn
  static const cyan800 = Color(0xFF005464);
  static const cyan900 = Color(0xFF063A48);
  static const cyan950 = Color(0xFF02222D); // chữ trên nút chính, nền thanh điều hướng

  // xám ánh cyan
  static const n0 = Color(0xFFFFFFFF);
  static const n25 = Color(0xFFF8FCFD);
  static const n50 = Color(0xFFF2F8F9); // nền app
  static const n100 = Color(0xFFE7EFF1);
  static const n200 = Color(0xFFD9E4E7); // viền
  static const n300 = Color(0xFFC6D4D8);
  static const n400 = Color(0xFF9BADB3);
  static const n500 = Color(0xFF70848B);
  static const n600 = Color(0xFF52676F); // chữ phụ
  static const n700 = Color(0xFF394D54);
  static const n800 = Color(0xFF213239);
  static const n900 = Color(0xFF0E1C21); // chữ chính
  static const lineStrong = Color(0xFF8398A0); // viền ô nhập

  // ngữ nghĩa theo vòng đời chuyến
  static const amber50 = Color(0xFFFFF6E1), amber200 = Color(0xFFFBD98F), amber500 = Color(0xFFFAAB35), amber700 = Color(0xFF9D580C);
  static const violet50 = Color(0xFFF3F1FF), violet200 = Color(0xFFD6CEFD), violet500 = Color(0xFF8264E7), violet700 = Color(0xFF613EBE);
  static const green50 = Color(0xFFE5FAEB), green200 = Color(0xFFB2EBC3), green500 = Color(0xFF36AC62), green700 = Color(0xFF156F41);
  static const red50 = Color(0xFFFFEFED), red200 = Color(0xFFF8C3BE), red500 = Color(0xFFDB4241), red700 = Color(0xFFB02A2D);

  // điểm giao Okabe–Ito — chỉ để định danh điểm giao; chữ trên mốc luôn 0xFF101828
  static const stops = [Color(0xFFE69F00), Color(0xFF56B4E9), Color(0xFF009E73), Color(0xFFF0E442),
    Color(0xFF0072B2), Color(0xFFD55E00), Color(0xFFCC79A7), Color(0xFF555555)];
  static const stopOn = Color(0xFF101828);

  // 3D và kính (chỉ thanh điều hướng dưới + lớp phủ trên khung 3D)
  static const canvas = Color(0xFF031F29);
  static const glassDarkTop = Color(0x9E0A2C37); // rgba(10,44,55,.62)
  static const glassDarkBottom = Color(0x8C041E27); // rgba(4,30,39,.55)
  static const glassDarkBorder = Color(0x299BEDF2); // rgba(155,237,242,.16)
  static const glassNavLight = Color(0xDBF8FCFD); // thanh điều hướng dưới, rgba(248,252,253,.86)
  static const current = Color(0xFFF7CF40); // kiện "Hiện tại"

  // nút chính: gradient + chữ tối
  static const primaryFill = [Color(0xFF2ED6E4), cyan400];
  static const primaryBorder = Color(0xFF00B5C6);
}

abstract final class LmFonts {
  static const display = 'Archivo'; // tiêu đề, số lớn (weight 650–700, width 106–112%)
  static const text = 'Be Vietnam Pro';
  static const mono = 'JetBrains Mono'; // mã kiện, mã chuyến, số đo — luôn tabular figures
}

abstract final class LmSize {
  // vùng chạm: tài xế và kho ≥ 56, điều phối / quản lý ≥ 48
  static const touchField = 56.0;
  static const touchOffice = 48.0;
  static const radiusSm = 6.0, radiusMd = 10.0, radiusLg = 14.0, radiusXl = 18.0;
  static const phone = Size(390, 844);
  static const tablet = Size(1024, 768);
}
