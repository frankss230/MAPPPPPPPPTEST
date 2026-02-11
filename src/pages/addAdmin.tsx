import { useState } from 'react';
import { sanitizeDigits } from '@/utils/inputSanitizers';

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fname: '',
    sname: '',
    users_pin: '',
    users_line_id: '',
    users_status_onweb: 1,
    users_number: '',
    users_moo: '',
    users_road: '',
    users_tubon: '',
    users_amphur: '',
    users_province: '',
    users_postcode: '',
    users_tel1: '',
    users_alert_battery: 0,
    users_status_active: 1,
    users_related_borrow: '',
    users_token: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'users_moo' ? sanitizeDigits(value) : value;
    setFormData({
      ...formData,
      [name]: nextValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ทำการส่งข้อมูลไปยัง backend
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-pink-600 mb-6">เพิ่มผู้ดูแลระบบใหม่</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">ชื่อจริง</label>
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">นามสกุล</label>
              <input
                type="text"
                name="sname"
                value={formData.sname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">PIN</label>
              <input
                type="number"
                name="users_pin"
                value={formData.users_pin}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">Line ID</label>
              <input
                type="text"
                name="users_line_id"
                value={formData.users_line_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">บ้านเลขที่</label>
              <input
                type="text"
                name="users_number"
                value={formData.users_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">หมู่</label>
              <input
                type="text"
                name="users_moo"
                value={formData.users_moo}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">ถนน</label>
              <input
                type="text"
                name="users_road"
                value={formData.users_road}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">ตำบล</label>
              <input
                type="text"
                name="users_tubon"
                value={formData.users_tubon}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">อำเภอ</label>
              <input
                type="text"
                name="users_amphur"
                value={formData.users_amphur}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">จังหวัด</label>
              <input
                type="text"
                name="users_province"
                value={formData.users_province}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">รหัสไปรษณีย์</label>
              <input
                type="text"
                name="users_postcode"
                value={formData.users_postcode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-gray-700">เบอร์โทร</label>
              <input
                type="text"
                name="users_tel1"
                value={formData.users_tel1}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-4 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
