import { useState } from "react";
import { invoke, PermissionState } from "@tauri-apps/api/core";
import styles from  "./App.module.scss";
/* import checkPermissions from "tauri-plugin-android-mock-location-api"; */

type Location =
{
	lat: number;
	lon: number;
};

interface Permissions
{
	coarseLocation: PermissionState;
	fineLocation: PermissionState;
}

const coords: Array<Location> = [
	{ lat: 55.7558, lon: 37.6173 }, // Moscow
	{ lat: 59.9343, lon: 30.3351 }, // St Petersburg
];

function App()
{
	const [consoleOutput, setConsoleOutput] = useState("Hi there!");
	const [currentSpoofedLocation, setCurrentSpoofedLocation] = useState<Location | null>(null);

	const checkPermissions = async (): Promise<boolean> =>
	{
		const permissions = await invoke<Permissions>('plugin:android-mock-location|checkPermissions');
		var locationGranted = false;
		var mockLocationProviderSet = false;

		if (permissions.coarseLocation === 'granted' || permissions.fineLocation === 'granted') locationGranted = true;
		else
		{
			const state = await invoke<Permissions>('plugin:android-mock-location|requestPermissions', { permissions: ['coarseLocation', 'fineLocation'] });
			locationGranted = state.coarseLocation === 'granted' || state.fineLocation === 'granted';
		}

		mockLocationProviderSet = true;

		return locationGranted && mockLocationProviderSet;
	};

	const startSpoofing = () =>
	{
		setConsoleOutput("Checking permissions...");

		checkPermissions().then(granted =>
		{
			if (granted)
			{
				setCurrentSpoofedLocation(coords[0]);
				setConsoleOutput("Started spoofing");
			}
			else if (currentSpoofedLocation !== null) stopSpoofing();
		})
		.catch(error => setConsoleOutput(`Error: ${error}`));
	};

	const stopSpoofing = () =>
	{
		setConsoleOutput("Stopped spoofing");
		setCurrentSpoofedLocation(null);
	};

	return (
		<main className={styles.main}>
			<h1 className={styles.h1}>RouteSpoofer</h1>

			<button className={styles.button} onClick={currentSpoofedLocation == null ? startSpoofing : stopSpoofing}>
				{currentSpoofedLocation == null ? "Start" : "Stop"} spoofing
			</button>

			<p className={styles.text}>{consoleOutput}</p>
		</main>
	);
}

export default App;