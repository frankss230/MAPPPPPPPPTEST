'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

import { GoogleMap, Marker, useLoadScript, InfoWindow, DrawingManager, Polygon, Circle, DirectionsRenderer } from '@react-google-maps/api';
import Spinner from 'react-bootstrap/Spinner';

import styles from '@/styles/page.module.css'
import { encrypt } from '@/utils/helpers'

interface Location {
    latitude: number;
    longitude: number;
}
interface DataUserState {
    isLogin: boolean;
    userData: any | null
    takecareData: any | null
}

const Location = () => {
    const router = useRouter();
    // const { loadScript } = useLoadScript();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.GoogleMapsApiKey as string
    });
    const containerStyle = {
        width: '100vw',
        height: '100vh'
    };

    const [mapRef, setMapRef] = useState()
    const [infoWindowData, setInfoWindowData] = useState({ id: 0, address: '', show: false });
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [isLoading, setLoading] = useState(true);
    const [dataUser, setDataUser] = useState<DataUserState>({ isLogin: false, userData: null, takecareData: null })
    const [directions, setDirections] = useState<any | null>(null);
    const [range1, setRange1] = useState(10)
    const [range2, setRange2] = useState(20)


    const [origin, setOrigin] = useState({ lat: 0, lng: 0 }); // Default origin
    const [destination, setDestination] = useState({ lat: 0, lng: 0 }); // Default destination

    useEffect(() => {
        // ใช้ Optional Chaining (?) แทนการใช้ ! เยอะๆ จะปลอดภัยกว่า
        if (!dataUser?.takecareData?.userData?.origin?.lat) return;

        const interval = setInterval(async () => {
            try {
                // แก้จุดนี้: ห้ามเคาะเว้นวรรคตรงเครื่องหมาย / เด็ดขาด
                const url = `${process.env.WEB_DOMAIN}/api/location/getLocation?takecare_id=${dataUser.takecareData.takecare_id}&users_id=${dataUser.userData.users_id}`;

                const resLocation = await axios.get(url);

                if (resLocation.data?.data) {
                    const data = resLocation.data.data;
                    setDestination({
                        lat: Number(data.locat_latitude),
                        lng: Number(data.locat_longitude),
                    });
                }
            } catch (err) {
                console.log("realtime location error", err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [dataUser, origin]); // อย่าลืมเช็คว่า origin มีตัวตนในหน้านี้ไหม

    useEffect(() => {
        const auToken = router.query.auToken
        if (auToken && isLoaded) {
            onGetUserData(auToken as string)
        }


    }, [router.query.auToken, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                    destination: new window.google.maps.LatLng(destination.lat, destination.lng),
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        setDirections(null);
                    }
                }
            );
        }
    }, [origin, destination, isLoaded]);

    const onGetSafezone = async (idSafezone: string, takecareData: any, userData: any) => {
        try {
            const resSafezone = await axios.get(`${process.env.WEB_DOMAIN}/api/setting/getSafezone?takecare_id=${takecareData.takecare_id}&users_id=${userData.users_id}&id=${idSafezone}`);
            if (resSafezone.data?.data) {
                const data = resSafezone.data?.data
                setOrigin({
                    lat: Number(data.safez_latitude),
                    lng: Number(data.safez_longitude),
                });
                setRange1(data.safez_radiuslv1)
                setRange2(data.safez_radiuslv2)
                onGetLocation(data, takecareData, userData)
            }
        } catch (error) {
            console.log("🚀 ~ file: registration.tsx:66 ~ onGetUserData ~ error:", error)
            setDataUser({ isLogin: false, userData: null, takecareData: null })
            setAlert({ show: true, message: 'ระบบไม่สามารถดึงข้อมูล Safezone ของท่านได้ กรุณาลองใหม่อีกครั้ง' })
            setLoading(false)
        }
    }

    const onGetLocation = async (safezoneData: any, takecareData: any, userData: any) => {
        try {
            const resLocation = await axios.get(`${process.env.WEB_DOMAIN}/api/location/getLocation?takecare_id=${takecareData.takecare_id}&users_id=${userData.users_id}&safezone_id=${safezoneData.safezone_id}&location_id=${router.query.idlocation}`);
            if (resLocation.data?.data) {
                const data = resLocation.data?.data
                setDestination({
                    lat: Number(data.locat_latitude),
                    lng: Number(data.locat_longitude),
                });
            } else {
                setDestination({
                    lat: Number(safezoneData.safez_latitude),
                    lng: Number(safezoneData.safez_longitude),
                });
            }
            setLoading(false)
        } catch (error) {
            console.log("🚀 ~ file: registration.tsx:66 ~ onGetUserData ~ error:", error)
            setDataUser({ isLogin: false, userData: null, takecareData: null })
            setAlert({ show: true, message: 'ระบบไม่สามารถดึงข้อมูล Safezone ของท่านได้ กรุณาลองใหม่อีกครั้ง' })
            setLoading(false)
        }
    }

    const alertModal = () => {
        setAlert({ show: true, message: 'ระบบไม่สามารถดึงข้อมูลของท่านได้ กรุณาลองใหม่อีกครั้ง' })
        setDataUser({ isLogin: false, userData: null, takecareData: null })
    }

    const onGetUserData = async (auToken: string) => {
        try {
            const responseUser = await axios.get(`${process.env.WEB_DOMAIN}/api/user/getUser/${auToken}`);
            if (responseUser.data?.data) {
                const encodedUsersId = encrypt(responseUser.data?.data.users_id.toString());

                const responseTakecareperson = await axios.get(`${process.env.WEB_DOMAIN}/api/user/getUserTakecareperson/${encodedUsersId}`);
                const data = responseTakecareperson.data?.data
                if (data) {
                    setDataUser({ isLogin: false, userData: responseUser.data?.data, takecareData: data })
                    onGetSafezone(router.query.idsafezone as string, data, responseUser.data?.data)
                } else {
                    alertModal()
                }
            } else {
                alertModal()
            }
        } catch (error) {
            console.log("🚀 ~ file: registration.tsx:66 ~ onGetUserData ~ error:", error)
            setDataUser({ isLogin: false, userData: null, takecareData: null })
            setAlert({ show: true, message: 'ระบบไม่สามารถดึงข้อมูลของท่านได้ กรุณาลองใหม่อีกครั้ง' })
            setLoading(false)
        }
    }


    const center = useMemo(() => ({ lat: origin.lat, lng: origin.lng }), [origin]);

    const handleMarkerClick = (id: number, lat: number, lng: number, address: string) => {
        //     mapRef?.panTo({ lat, lng });
        setInfoWindowData({ id, address, show: true });
    };
    const polygonOptions = {
        strokeColor: "yellow",
        strokeOpacity: 0.5,
        strokeWeight: 3.0,
        fillColor: "red",
        fillOpacity: 0.2,
    };

    if ((origin.lat === 0 && origin.lng === 0) || (destination.lat === 0 && destination.lng === 0)) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        )
    }

    return (
        <>
            {
                !isLoaded ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <>
                        <GoogleMap
                            clickableIcons={false}
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={14}
                            options={{
                                mapTypeControl: true,
                                streetViewControl: false,
                                zoomControlOptions: {
                                    position: google.maps.ControlPosition.LEFT_CENTER,
                                },

                            }}
                        >
                            <Marker
                                position={{ lat: destination.lat, lng: destination.lng }}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/kml/pal2/icon6.png',
                                    scaledSize: new window.google.maps.Size(35, 35)
                                }}
                                onClick={() => {
                                    handleMarkerClick(1, destination.lat, destination.lng, 'ผู้มีภาวะพึ่งพิง');
                                }}
                            >
                                {infoWindowData.show && (
                                    <InfoWindow
                                        onCloseClick={() => {
                                            setInfoWindowData({ id: 0, address: '', show: false });
                                        }}
                                    >
                                        <h3>{infoWindowData.address}</h3>
                                    </InfoWindow>
                                )}
                            </Marker>
                            <Marker
                                position={{ lat: origin.lat, lng: origin.lng }}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/kml/pal2/icon10.png',
                                    scaledSize: new window.google.maps.Size(35, 35),
                                }}
                            >
                                <>
                                    <Circle
                                        center={{ lat: origin.lat, lng: origin.lng }}
                                        radius={range1}
                                        options={{ fillColor: "#F2BE22", strokeColor: "#F2BE22", fillOpacity: 0.2 }}
                                    />
                                    <Circle
                                        center={{ lat: origin.lat, lng: origin.lng }}
                                        radius={range2}
                                        options={{ fillColor: "#F24C3D", strokeColor: "#F24C3D", fillOpacity: 0.1 }}
                                    />
                                </>
                            </Marker>
                            {/* {directions && (
  <DirectionsRenderer 
    directions={directions}
    options={{
      suppressMarkers: true
    }}
  />
)} */}

                        </GoogleMap>
                        <div className={styles.buttonLayout}>
                            {dataUser.takecareData?.takecare_tel1 && (
                                <a className={`btn btn-primary ${styles.button}`} href={`tel:${dataUser.takecareData?.takecare_tel1}`}> โทรหาผู้มีภาวะพึ่งพิง <i className="fas fa-phone"></i> </a>)}
                        </div>

                    </>
                )
            }


        </>
    )
}

export default Location