import os
import django
import sys

# Thiết lập môi trường Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from content.models import BaiViet, VinhDanh

def seed_data():
    print("--- Cleaning old data ---")
    VinhDanh.objects.all().delete()
    BaiViet.objects.all().delete()

    print("--- Seeding Vinh Danh ---")
    VinhDanh.objects.create(
        TenSinhVien="Nguyễn Hoàng Nam",
        ThanhTich="Sinh viên 5 tốt cấp Trung ương",
        NoiDung="Gương mặt tiêu biểu với thành tích học tập xuất sắc (GPA 3.9/4.0) và tích cực trong các hoạt động tình nguyện quốc tế.",
        HinhAnh="vinh_danh/student_1.png"
    )
    VinhDanh.objects.create(
        TenSinhVien="Lê Thị Thanh Trúc",
        ThanhTich="Giải Nhất Nghiên cứu khoa học cấp Thành phố",
        NoiDung="Không chỉ học giỏi, Thanh Trúc còn là thủ lĩnh sinh viên năng nổ, dẫn đầu nhiều dự án khởi nghiệp sáng tạo.",
        HinhAnh="vinh_danh/student_2.png"
    )
    VinhDanh.objects.create(
        TenSinhVien="Trần Minh Hoàng",
        ThanhTich="Giải Nhì Lập trình sinh viên quốc tế (ICPC)",
        NoiDung="Hoàng là một 'coder' thực thụ với tư duy logic sắc bén, luôn nằm trong top đầu các cuộc thi lập trình uy tín.",
        HinhAnh="vinh_danh/student_3.jpg"
    )

    print("--- Seeding News Posts ---")
    BaiViet.objects.create(
        TieuDe="Khai mạc Ngày hội Hiến máu nhân đạo 'Giọt hồng DUE 2024'",
        NoiDung="Ngày hội đã thu hút hơn 1000 sinh viên tham gia, thể hiện tinh thần tương thân tương ái của tuổi trẻ nhà trường.",
        HinhAnh="bai_viet/news_1.jpg",
        TrangThai="published"
    )
    BaiViet.objects.create(
        TieuDe="Công bố danh sách Sinh viên đạt danh hiệu Sinh viên 5 tốt cấp Trường",
        NoiDung="Sau quá trình xét duyệt kỹ lưỡng, Hội sinh viên chính thức công bố 150 cá nhân xuất sắc đạt danh hiệu cao quý này.",
        HinhAnh="bai_viet/news_2.jpg",
        TrangThai="published"
    )
    BaiViet.objects.create(
        TieuDe="Tọa đàm: Kỹ năng chinh phục nhà tuyển dụng dành cho sinh viên cuối khóa",
        NoiDung="Chương trình có sự góp mặt của các chuyên gia nhân sự hàng đầu từ các tập đoàn lớn, giúp sinh viên tự tin hơn khi ra trường.",
        HinhAnh="bai_viet/news_3.jpg",
        TrangThai="published"
    )

    print("--- FINISHED ---")

if __name__ == "__main__":
    seed_data()
