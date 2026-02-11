declare namespace NodeJS {
    interface Global {
        prisma: any;
    }
}

type LayoutMetaProps = {
    title: string;
    description: string;
    slug: string;
    titleBar: string;
}

type UserDataProps = {
    users_id             : number;
    users_fname          : string;
    users_sname          : string;
    users_pin            : number;
    users_number        ?: string;
    users_moo           ?: string;
    users_road          ?: string;
    users_tubon         ?: string;
    users_amphur        ?: string;
    users_province      ?: string;
    users_postcode      ?: string;
    users_tel1          ?: string;
    users_tel_home      ?: string;
    status_id            : number;
    users_status_active ?: number;
    users_related_borrow?: string;
}

type UserTakecareProps = {
    users_id          : number;
    takecare_id       : number;
    takecare_fname    : string;
    takecare_sname    : string;
    takecare_birthday : string;
    gender_id         : number;
    marry_id          : number;
    takecare_number  ?: string;
    takecare_moo     ?: string;
    takecare_road    ?: string;
    takecare_tubon   ?: string;
    takecare_amphur  ?: string;
    takecare_province?: string;
    takecare_postcode?: string;
    takecare_tel1    ?: string;
    takecare_tel_home?: string;
    takecare_disease ?: string;
    takecare_drug    ?: string;
    takecare_status  ?: number;
}

type Alert = {
    show    : boolean;
    title  ?: string;
    message?: string;
    redirectTo?: string;
}

type ModalsState = {
    alert     : Alert | null;
    processing: boolean;
}
