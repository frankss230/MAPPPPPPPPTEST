'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Circle, DirectionsRenderer, GoogleMap, InfoWindow, MarkerF, useLoadScript } from '@react-google-maps/api'
import Spinner from 'react-bootstrap/Spinner'

import styles from '@/styles/page.module.css'
import { encrypt } from '@/utils/helpers'
import { supabase } from '@/lib/supabaseClient'

interface DataUserState {
  isLogin: boolean
  userData: any | null
  takecareData: any | null
}

const MAP_CONTAINER_STYLE: React.CSSProperties = { width: '100%', height: '100vh' }
const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 }
const POS_ANIMATION_DURATION = 800

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t

function useAnimatedPosition(targetPos: google.maps.LatLngLiteral | null) {
  const [visualPos, setVisualPos] = useState<google.maps.LatLngLiteral | null>(targetPos)
  const prevPosRef = useRef<google.maps.LatLngLiteral | null>(targetPos)
  const targetPosRef = useRef<google.maps.LatLngLiteral | null>(targetPos)
  const startTimeRef = useRef<number>(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!targetPos) return

    if (!prevPosRef.current) {
      prevPosRef.current = targetPos
      targetPosRef.current = targetPos
      setVisualPos(targetPos)
      return
    }

    prevPosRef.current = visualPos
    targetPosRef.current = targetPos
    startTimeRef.current = performance.now()

    const animate = (time: number) => {
      if (!prevPosRef.current || !targetPosRef.current) return

      const elapsed = time - startTimeRef.current
      const progress = Math.min(elapsed / POS_ANIMATION_DURATION, 1)
      const ease = 1 - (1 - progress) * (1 - progress)

      const lat = lerp(prevPosRef.current.lat, targetPosRef.current.lat, ease)
      const lng = lerp(prevPosRef.current.lng, targetPosRef.current.lng, ease)

      setVisualPos({ lat, lng })

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        prevPosRef.current = { lat, lng }
      }
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameRef.current)
  }, [targetPos, visualPos])

  return visualPos
}

const Location = () => {
  const router = useRouter()
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GoogleMapsApiKey || '') as string,
  })

  const [infoWindowData, setInfoWindowData] = useState({ id: 0, address: '', show: false })
  const [alert, setAlert] = useState({ show: false, message: '' })
  const [isLoading, setLoading] = useState(true)
  const [dataUser, setDataUser] = useState<DataUserState>({ isLogin: false, userData: null, takecareData: null })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [routeStats, setRouteStats] = useState<{ duration: string; distance: string } | null>(null)

  const [range1, setRange1] = useState(10)
  const [range2, setRange2] = useState(20)
  const [origin, setOrigin] = useState({ lat: 0, lng: 0 })
  const [destination, setDestination] = useState({ lat: 0, lng: 0 })

  const hasOrigin = origin.lat !== 0 && origin.lng !== 0
  const hasDestination = destination.lat !== 0 && destination.lng !== 0

  const animatedDestination = useAnimatedPosition(hasDestination ? destination : null)

  const mapCenter = useMemo(() => {
    if (animatedDestination) return animatedDestination
    if (hasDestination) return destination
    if (hasOrigin) return origin
    return DEFAULT_CENTER
  }, [animatedDestination, destination, hasDestination, hasOrigin, origin])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handleRecenter = () => {
    if (!mapRef.current) return
    mapRef.current.panTo(mapCenter)
    mapRef.current.setZoom(19)
  }

  useEffect(() => {
    if (!dataUser?.userData?.users_id || !dataUser?.takecareData?.takecare_id) return

    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('takecare_id', dataUser.takecareData.takecare_id)
        .single()

      if (data) {
        setDestination({
          lat: Number(data.locat_latitude),
          lng: Number(data.locat_longitude),
        })
      }
    }

    fetchInitialLocation()

    const channel = supabase
      .channel('schema-db-changes-location')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'locations',
          filter: `takecare_id=eq.${dataUser.takecareData.takecare_id}`,
        },
        (payload) => {
          if (payload.new) {
            setDestination({
              lat: Number(payload.new.locat_latitude),
              lng: Number(payload.new.locat_longitude),
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dataUser])

  useEffect(() => {
    if (!isLoaded || !hasOrigin || !hasDestination) return

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result)
          const leg = result.routes[0]?.legs?.[0]
          setRouteStats({
            duration: leg?.duration?.text || '--',
            distance: leg?.distance?.text || '--',
          })
        } else {
          setDirections(null)
          setRouteStats(null)
        }
      }
    )
  }, [origin, destination, isLoaded, hasOrigin, hasDestination])

  const onGetLocation = useCallback(async (safezoneData: any, takecareData: any, userData: any) => {
    try {
      const resLocation = await axios.get(
        `${process.env.WEB_DOMAIN}/api/location/getLocation?takecare_id=${takecareData.takecare_id}&users_id=${userData.users_id}&safezone_id=${safezoneData.safezone_id}&location_id=${router.query.idlocation}`
      )
      if (resLocation.data?.data) {
        const data = resLocation.data?.data
        setDestination({
          lat: Number(data.locat_latitude),
          lng: Number(data.locat_longitude),
        })
      } else {
        setDestination({
          lat: Number(safezoneData.safez_latitude),
          lng: Number(safezoneData.safez_longitude),
        })
      }
      setLoading(false)
    } catch (error) {
      setDataUser({ isLogin: false, userData: null, takecareData: null })
      setAlert({ show: true, message: 'โหลดข้อมูลตำแหน่งไม่สำเร็จ' })
      setLoading(false)
    }
  }, [router.query.idlocation])

  const onGetSafezone = useCallback(async (idSafezone: string, takecareData: any, userData: any) => {
    try {
      const resSafezone = await axios.get(
        `${process.env.WEB_DOMAIN}/api/setting/getSafezone?takecare_id=${takecareData.takecare_id}&users_id=${userData.users_id}&id=${idSafezone}`
      )
      if (resSafezone.data?.data) {
        const data = resSafezone.data?.data
        setOrigin({
          lat: Number(data.safez_latitude),
          lng: Number(data.safez_longitude),
        })
        setRange1(data.safez_radiuslv1)
        setRange2(data.safez_radiuslv2)
        await onGetLocation(data, takecareData, userData)
      }
    } catch (error) {
      setDataUser({ isLogin: false, userData: null, takecareData: null })
      setAlert({ show: true, message: 'โหลดข้อมูล Safezone ไม่สำเร็จ' })
      setLoading(false)
    }
  }, [onGetLocation])

  const onGetUserData = useCallback(async (auToken: string) => {
    try {
      const responseUser = await axios.get(`${process.env.WEB_DOMAIN}/api/user/getUser/${auToken}`)
      if (responseUser.data?.data) {
        const encodedUsersId = encrypt(responseUser.data?.data.users_id.toString())

        const responseTakecareperson = await axios.get(
          `${process.env.WEB_DOMAIN}/api/user/getUserTakecareperson/${encodedUsersId}`
        )
        const data = responseTakecareperson.data?.data
        if (data) {
          setDataUser({ isLogin: false, userData: responseUser.data?.data, takecareData: data })
          await onGetSafezone(router.query.idsafezone as string, data, responseUser.data?.data)
        } else {
          setAlert({ show: true, message: 'ไม่พบข้อมูลผู้ดูแล' })
          setLoading(false)
        }
      } else {
        setAlert({ show: true, message: 'ไม่พบข้อมูลผู้ใช้' })
        setLoading(false)
      }
    } catch (error) {
      setDataUser({ isLogin: false, userData: null, takecareData: null })
      setAlert({ show: true, message: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ' })
      setLoading(false)
    }
  }, [onGetSafezone, router.query.idsafezone])

  useEffect(() => {
    const auToken = router.query.auToken
    if (auToken && isLoaded) {
      onGetUserData(auToken as string)
    } else if (router.isReady && !auToken) {
      setLoading(false)
    }
  }, [router.isReady, router.query.auToken, isLoaded, onGetUserData])

  if (loadError) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div>ไม่สามารถโหลด Google Maps ได้</div>
      </div>
    )
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#111827' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          left: 16,
          right: 16,
          top: 16,
          background: '#0F5338',
          color: '#fff',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>Live Navigation Map</div>
        <div style={{ opacity: 0.85, fontSize: 13 }}>Tracking patient location in realtime</div>
      </div>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={19}
        onLoad={onMapLoad}
        options={{ disableDefaultUI: true, mapTypeId: 'hybrid', tilt: 45, gestureHandling: 'greedy' }}
      >
        {hasOrigin && (
          <>
            <MarkerF
              position={origin}
              icon={{
                url: 'https://maps.google.com/mapfiles/kml/pal2/icon10.png',
                scaledSize: new window.google.maps.Size(34, 34),
              }}
            />
            <Circle
              center={origin}
              radius={range1}
              options={{ fillColor: '#F2BE22', strokeColor: '#F2BE22', fillOpacity: 0.2 }}
            />
            <Circle
              center={origin}
              radius={range2}
              options={{ fillColor: '#F24C3D', strokeColor: '#F24C3D', fillOpacity: 0.1 }}
            />
          </>
        )}

        {animatedDestination && (
          <MarkerF
            position={animatedDestination}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
              scaledSize: new window.google.maps.Size(44, 44),
            }}
            onClick={() => setInfoWindowData({ id: 1, address: 'ตำแหน่งผู้ป่วย', show: true })}
          >
            {infoWindowData.show && (
              <InfoWindow onCloseClick={() => setInfoWindowData({ id: 0, address: '', show: false })}>
                <h3 style={{ margin: 0, fontSize: 14 }}>{infoWindowData.address}</h3>
              </InfoWindow>
            )}
          </MarkerF>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: { strokeColor: '#4285F4', strokeWeight: 8, strokeOpacity: 0.9 },
            }}
          />
        )}
      </GoogleMap>

      <button
        type="button"
        onClick={handleRecenter}
        style={{
          position: 'absolute',
          zIndex: 20,
          left: 16,
          bottom: 150,
          border: 0,
          borderRadius: 999,
          background: '#fff',
          color: '#2563eb',
          padding: '10px 14px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        ปรับจุดกึ่งกลาง
      </button>

      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -6px 20px rgba(0,0,0,0.2)',
          padding: '16px 18px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 800, color: '#188038' }}>
              {routeStats?.duration || '--'}
            </div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{routeStats?.distance || 'Calculating...'}</div>
          </div>
          {dataUser.takecareData?.takecare_tel1 && (
            <a className={`btn btn-primary ${styles.button}`} href={`tel:${dataUser.takecareData?.takecare_tel1}`}>
              โทรหา
            </a>
          )}
        </div>
      </div>

      {alert.show && (
        <div
          style={{
            position: 'absolute',
            zIndex: 30,
            left: 16,
            right: 16,
            bottom: 220,
            background: 'rgba(220,38,38,0.95)',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 13,
          }}
        >
          {alert.message}
        </div>
      )}
    </div>
  )
}

export default Location

