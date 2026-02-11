import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Table, Button, Modal, Form } from 'react-bootstrap';

// ------ FullCalendar ------
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

// 1. สร้าง Interface สำหรับโครงสร้างข้อมูลอุปกรณ์
interface Equipment {
  equipment_id: number;
  equipment_name: string;
  equipment_code: string;
  equipment_status: number;
  equipment_create_date?: string; // หรือ Date ตามจริงใน DB
  equipment_update_date?: string; // หรือ Date ตามจริงใน DB
}

// 2. สร้าง Interface สำหรับ “ข้อมูลการยืม” ที่จะใช้แสดงบนปฏิทิน
interface BorrowEvent {
  title: string;       // ชื่อ event ที่จะแสดงในปฏิทิน
  start: string;       // วันเริ่มยืม (YYYY-MM-DD)
  end: string;         // วันสิ้นสุดยืม (YYYY-MM-DD)
  color?: string;      // สีของแถบ
  textColor?: string;  // สีตัวอักษร
}

const CheckEquipmentPage: React.FC = () => {
  // State สำหรับข้อมูลอุปกรณ์
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับ Modal และการยืม
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [startDate, setStartDate] = useState<string>('');

  // **(A) ตัวอย่าง Mock Data ของการยืม**  
  // (สมมติว่าอุปกรณ์นาฬิกา 2 ชิ้น ถูกยืมในช่วงวันต่างกัน)
  // คุณสามารถเปลี่ยนข้อมูลนี้ให้มาจาก API จริงได้
  const mockBorrowEvents: BorrowEvent[] = [
    {
      title: 'นาฬิกา A ถูกยืม',
      start: '2025-02-10',
      end: '2025-02-20',
      color: 'red',
      textColor: 'white',
    },
    {
      title: 'นาฬิกา B ถูกยืม',
      start: '2025-02-18',
      end: '2025-03-05',
      color: 'red',
      textColor: 'white',
    },
    {
      title: 'นาฬิกา C ถูกยืม',
      start: '2025-03-01',
      end: '2025-03-10',
      color: 'red',
      textColor: 'white',
    },
  ];

  // ดึงข้อมูลอุปกรณ์จาก API (เฉพาะนาฬิกา หรือทั้งหมดก็ได้)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // เปลี่ยน URL ให้ตรงกับ endpoint ที่ใช้งานจริง
        // ตัวอย่าง: /api/equipment
        const response = await axios.get('/api/borrowequipment/getAvailableEquipment');
        // สมมติว่า API ส่งกลับในรูปแบบ { data: Equipment[] }
        if (response.data?.data) {
          setEquipmentList(response.data.data);
        } else {
          setEquipmentList(response.data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setError('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // กรองข้อมูลเฉพาะอุปกรณ์นาฬิกา (โดยดูจากชื่อหรือรหัส)
  const clockEquipment = equipmentList.filter((item) =>
    item.equipment_name.toLowerCase().includes('นาฬิกา') ||
    item.equipment_code.toLowerCase().includes('watch')
  );

  // คำนวณวันที่สิ้นสุดโดยเพิ่ม 90 วันจากวันที่เริ่มยืม
  const calculateEndDate = (start: string) => {
    return moment(start).add(90, 'days').format('YYYY-MM-DD');
  };

  // เมื่อคลิกเลือกอุปกรณ์ให้เปิด Modal
  const handleSelectEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowModal(true);
    // กำหนดค่า default startDate เป็นวันนี้
    setStartDate(moment().format('YYYY-MM-DD'));
  };

  // เมื่อกดบันทึกการยืมใน Modal
  const handleBorrow = async () => {
    if (!selectedEquipment || !startDate) return;

    const endDate = calculateEndDate(startDate);
    try {
      // ส่งข้อมูลไปยัง API สำหรับสร้างรายการยืม (ตัวอย่าง)
      await axios.post('/api/borrow/create', {
        equipmentId: selectedEquipment.equipment_id,
        startDate,
        endDate,
        borrowUserId: 123, // ตัวอย่าง: รหัสผู้ใช้งานที่ยืม
      });
      alert('บันทึกการยืมสำเร็จ');
      setShowModal(false);

      // TODO: เมื่อบันทึกจริงเสร็จ ควรจะ re-fetch data ของ event
      // เพื่ออัปเดตปฏิทินตามข้อมูลจริง
      // เช่น fetchBorrowEvents() -> setMockBorrowEvents(...) 
      // (ในตัวอย่างนี้เป็น mock data จึงยังไม่เปลี่ยนอะไร)
    } catch (error) {
      console.error('Error borrowing equipment:', error);
      alert('ไม่สามารถบันทึกการยืมได้');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">ระบบยืมอุปกรณ์นาฬิกา</h2>

      {/* ----- (B) ส่วนแสดงปฏิทิน FullCalendar ----- */}
      <div className="mb-5">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          // ตั้งค่า start/end ใน mockBorrowEvents เพื่อให้แถบยาวครอบคลุมช่วงยืม
          events={mockBorrowEvents}
          height="auto"
        />
      </div>

      {/* ----- (C) ตารางแสดงรายการอุปกรณ์นาฬิกา ----- */}
      <h3>รายการอุปกรณ์นาฬิกา</h3>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : clockEquipment.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่ออุปกรณ์</th>
              <th>รหัสอุปกรณ์</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {clockEquipment.map((item, index) => (
              <tr key={item.equipment_id}>
                <td>{index + 1}</td>
                <td>{item.equipment_name}</td>
                <td>{item.equipment_code}</td>
                <td>{item.equipment_status === 1 ? 'ถูกยืม' : 'พร้อมใช้งาน'}</td>
                <td>
                  <Button variant="primary" onClick={() => handleSelectEquipment(item)}>
                    ยืมอุปกรณ์
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>ไม่พบข้อมูลอุปกรณ์นาฬิกา</p>
      )}

      {/* Modal สำหรับระบุวันที่เริ่มยืม */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>ยืมอุปกรณ์: {selectedEquipment?.equipment_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formStartDate">
              <Form.Label>วันที่เริ่มยืม</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Form.Text className="text-muted">
                วันที่สิ้นสุดจะถูกคำนวณอัตโนมัติ (เพิ่ม 90 วัน)
              </Form.Text>
            </Form.Group>
            {startDate && (
              <p className="mt-2">
                วันที่สิ้นสุด: <strong>{calculateEndDate(startDate)}</strong>
              </p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={handleBorrow}>
            บันทึกการยืม
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckEquipmentPage;
