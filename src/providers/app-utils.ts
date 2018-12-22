import { LatLng, GoogleMap, CameraPosition, ILatLng } from '@ionic-native/google-maps';


export class Utils {

    public static getRequestDate(date: Date) {
        return date.getFullYear() + "-" + ((date.getMonth() < 9) ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" + date.getDate();
    }

    public static animateCameraTo(map: GoogleMap, latLng: LatLng, duration: number, padding?: number) {
        if (map) {
            let cameraPosition: CameraPosition<ILatLng> = {
                target: latLng,
                duration: duration,
                padding: padding ? padding : 0
            }
            map.animateCamera(cameraPosition);
        }
    }
}