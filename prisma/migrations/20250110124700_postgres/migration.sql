-- CreateTable
CREATE TABLE "status" (
    "status_id" SERIAL NOT NULL,
    "status_name" VARCHAR(200) NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "gender" (
    "gender_id" SERIAL NOT NULL,
    "gender_describe" VARCHAR(100) NOT NULL,

    CONSTRAINT "gender_pkey" PRIMARY KEY ("gender_id")
);

-- CreateTable
CREATE TABLE "marrystatus" (
    "marry_id" SERIAL NOT NULL,
    "marry_describe" VARCHAR(100) NOT NULL,

    CONSTRAINT "marrystatus_pkey" PRIMARY KEY ("marry_id")
);

-- CreateTable
CREATE TABLE "users" (
    "users_id" SERIAL NOT NULL,
    "users_line_id" VARCHAR(33),
    "users_fname" VARCHAR(100) NOT NULL,
    "users_sname" VARCHAR(100) NOT NULL,
    "users_status_onweb" INTEGER NOT NULL DEFAULT 0,
    "users_number" VARCHAR(10),
    "users_moo" VARCHAR(5),
    "users_road" VARCHAR(200),
    "users_tubon" VARCHAR(100),
    "users_amphur" VARCHAR(100),
    "users_province" VARCHAR(100),
    "users_postcode" VARCHAR(5),
    "users_tel1" VARCHAR(12),
    "users_passwd" VARCHAR(100) NOT NULL,
    "users_pin" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "users_alert_battery" INTEGER DEFAULT 0,
    "users_status_active" INTEGER NOT NULL DEFAULT 1,
    "users_related_borrow" VARCHAR(255),
    "users_token" TEXT,
    "users_user" VARCHAR(100),

    CONSTRAINT "users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "takecareperson" (
    "users_id" INTEGER NOT NULL,
    "takecare_id" SERIAL NOT NULL,
    "takecare_fname" VARCHAR(100) NOT NULL,
    "takecare_sname" VARCHAR(100) NOT NULL,
    "takecare_birthday" DATE NOT NULL,
    "gender_id" INTEGER NOT NULL,
    "marry_id" INTEGER NOT NULL,
    "takecare_number" VARCHAR(10),
    "takecare_moo" VARCHAR(5),
    "takecare_road" VARCHAR(200),
    "takecare_tubon" VARCHAR(100),
    "takecare_amphur" VARCHAR(100),
    "takecare_province" VARCHAR(100),
    "takecare_postcode" VARCHAR(5),
    "takecare_tel1" VARCHAR(12),
    "takecare_disease" VARCHAR(300),
    "takecare_drug" VARCHAR(300),
    "takecare_status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "takecareperson_pkey" PRIMARY KEY ("takecare_id")
);

-- CreateTable
CREATE TABLE "safezone" (
    "takecare_id" INTEGER NOT NULL,
    "users_id" INTEGER NOT NULL,
    "safezone_id" SERIAL NOT NULL,
    "safez_latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "safez_longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "safez_radiuslv1" INTEGER NOT NULL DEFAULT 0,
    "safez_radiuslv2" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "safezone_pkey" PRIMARY KEY ("safezone_id")
);

-- CreateTable
CREATE TABLE "location" (
    "users_id" INTEGER NOT NULL,
    "takecare_id" INTEGER NOT NULL,
    "location_id" SERIAL NOT NULL,
    "locat_timestamp" DATE NOT NULL,
    "locat_latitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "locat_longitude" VARCHAR(255) NOT NULL DEFAULT '0',
    "locat_status" INTEGER NOT NULL DEFAULT 1,
    "locat_distance" INTEGER NOT NULL DEFAULT 0,
    "locat_battery" INTEGER NOT NULL DEFAULT 0,
    "locat_noti_time" TIMESTAMP(3),
    "locat_noti_status" INTEGER,

    CONSTRAINT "location_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "dlocation" (
    "dlocation_id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "locat_battery" INTEGER NOT NULL,
    "locat_distance" INTEGER NOT NULL,
    "locat_status" INTEGER NOT NULL,
    "locat_longitude" TEXT NOT NULL,
    "locat_latitude" TEXT NOT NULL,
    "locat_timestamp" TIMESTAMP(3) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "takecare_id" INTEGER NOT NULL,

    CONSTRAINT "dlocation_pkey" PRIMARY KEY ("dlocation_id")
);

-- CreateTable
CREATE TABLE "extendedhelp" (
    "exten_id" SERIAL NOT NULL,
    "exten_date" DATE NOT NULL,
    "user_id" INTEGER,
    "takecare_id" INTEGER,
    "exten_latitude" VARCHAR(255),
    "exten_longitude" VARCHAR(255),
    "exten_received_date" TIMESTAMP(3),
    "exten_received_user_id" INTEGER,
    "exted_closed_date" TIMESTAMP(3),
    "exten_closed_user_id" INTEGER,

    CONSTRAINT "extendedhelp_pkey" PRIMARY KEY ("exten_id")
);

-- CreateTable
CREATE TABLE "groupLine" (
    "group_id" SERIAL NOT NULL,
    "group_name" VARCHAR(100),
    "group_line_id" VARCHAR(100) NOT NULL,
    "group_status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "groupLine_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "borrowequipment" (
    "borrow_id" SERIAL NOT NULL,
    "borrow_date" DATE NOT NULL,
    "borrow_return" TIMESTAMP(3),
    "borrow_status" INTEGER NOT NULL DEFAULT 1,
    "borrow_user_id" INTEGER NOT NULL,
    "borrow_address" TEXT NOT NULL,
    "borrow_tel" VARCHAR(12) NOT NULL,
    "borrow_objective" TEXT NOT NULL,
    "borrow_name" VARCHAR(255) NOT NULL,
    "borrow_equipment_status" INTEGER NOT NULL DEFAULT 1,
    "borrow_create_date" DATE NOT NULL,
    "borrow_update_date" DATE NOT NULL,
    "borrow_update_user_id" INTEGER NOT NULL,
    "borrow_delete_date" TIMESTAMP(3),
    "status" INTEGER NOT NULL DEFAULT 1,
    "borrow_approver" INTEGER,
    "borrow_approver_date" TIMESTAMP(3),
    "borrow_return_user_id" INTEGER,
    "borrow_return_date" TIMESTAMP(3),
    "borrow_send_date" TIMESTAMP(3),
    "borrow_send_return" TIMESTAMP(3),
    "borrow_send_status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "borrowequipment_pkey" PRIMARY KEY ("borrow_id")
);

-- CreateTable
CREATE TABLE "borrowequipment_list" (
    "borrow_id" INTEGER NOT NULL,
    "borrow_equipment_id" SERIAL NOT NULL,
    "borrow_equipment" VARCHAR(255) NOT NULL,
    "borrow_equipment_number" VARCHAR(255) NOT NULL,
    "borrow_equipment_status" INTEGER NOT NULL DEFAULT 1,
    "borrow_equipment_delete" TIMESTAMP(3),

    CONSTRAINT "borrowequipment_list_pkey" PRIMARY KEY ("borrow_equipment_id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takecareperson" ADD CONSTRAINT "takecareperson_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "gender"("gender_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takecareperson" ADD CONSTRAINT "takecareperson_marry_id_fkey" FOREIGN KEY ("marry_id") REFERENCES "marrystatus"("marry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "takecareperson" ADD CONSTRAINT "takecareperson_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safezone" ADD CONSTRAINT "safezone_takecare_id_fkey" FOREIGN KEY ("takecare_id") REFERENCES "takecareperson"("takecare_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safezone" ADD CONSTRAINT "safezone_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_takecare_id_fkey" FOREIGN KEY ("takecare_id") REFERENCES "takecareperson"("takecare_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowequipment" ADD CONSTRAINT "borrowequipment_borrow_approver_fkey" FOREIGN KEY ("borrow_approver") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowequipment" ADD CONSTRAINT "borrowequipment_borrow_return_user_id_fkey" FOREIGN KEY ("borrow_return_user_id") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowequipment" ADD CONSTRAINT "borrowequipment_borrow_user_id_fkey" FOREIGN KEY ("borrow_user_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowequipment_list" ADD CONSTRAINT "borrowequipment_list_borrow_id_fkey" FOREIGN KEY ("borrow_id") REFERENCES "borrowequipment"("borrow_id") ON DELETE RESTRICT ON UPDATE CASCADE;
