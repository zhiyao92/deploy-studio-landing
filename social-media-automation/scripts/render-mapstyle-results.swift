import AppKit
import Foundation
import MapKit

func render(mapType: MKMapType, to url: URL) async throws {
    let options = MKMapSnapshotter.Options()
    options.region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 41.8902, longitude: 12.4922),
        span: MKCoordinateSpan(latitudeDelta: 0.012, longitudeDelta: 0.012)
    )
    options.size = CGSize(width: 900, height: 600)
    options.mapType = mapType
    options.showsBuildings = true
    options.pointOfInterestFilter = .includingAll

    let snapshot = try await MKMapSnapshotter(options: options).start()
    guard let data = snapshot.image.tiffRepresentation,
          let bitmap = NSBitmapImageRep(data: data),
          let png = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "MapStylePreview", code: 1)
    }
    try png.write(to: url)
}

@main
struct MapStylePreview {
    static func main() async throws {
        let output = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
        try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
        try await render(mapType: .standard, to: output.appendingPathComponent("swiftui-mapstyle-standard.png"))
        try await render(mapType: .satelliteFlyover, to: output.appendingPathComponent("swiftui-mapstyle-imagery.png"))
    }
}
