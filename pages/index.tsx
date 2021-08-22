import Head from 'next/head'
import {useRouter} from 'next/router'
import {DateTime} from 'luxon'
import tzdata from 'tzdata'

const RemoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DaylightIcon = () => (
  <svg
    className="h-6 w-6"
    fill="rgba(252, 211, 77, 0.7)"
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" x="0px" y="0px"
  >
    <title>185 Daylight Savings</title>
    <path d="M94.36,57C94.36,38.62,79,23.75,60,23.75S25.64,38.62,25.64,57,41,90.18,60,90.18,94.36,75.31,94.36,57ZM57.71,54.67V40.93h4.58V54.67H80.62v4.58H57.71Z"></path><path d="M108.11,57c0-25.9-21.58-47-48.11-47S11.89,31.07,11.89,57c0,18.69,11.27,34.81,27.49,42.37V94.28A42.28,42.28,0,0,1,16.47,57C16.47,33.59,36,14.58,60,14.58s43.53,19,43.53,42.38c0,22.52-18.15,40.94-40.95,42.26l3.52-3.52-3.25-3.23L57.32,98l-3.23,3.25,3.23,3.23L62.84,110l3.25-3.23-3-3C88.17,102.21,108.11,81.84,108.11,57Z"></path>
  </svg>
)

export default function Home(): JSX.Element {
  const router = useRouter()
  const query = router.query

  const date = query.date ? DateTime.fromISO(query.date) : DateTime.now()
  const startHour: number = query.startHour ? Number(query.startHour) : DateTime.now().toObject().hour

  let timezones: string[] = []

  if ('timezones' in query) {
    if (typeof query.timezones === 'string') {
      timezones = [query.timezones]
        .map(tz => tz in tzdata.zones ? tz : null)
        .filter(el => el !== null)
    } else {
      timezones = query.timezones
        .map(tz => tz in tzdata.zones ? tz : null)
        .filter(el => el !== null)
    }
  }

  if (timezones.length === 0) {
    timezones.push(date.zoneName)
    timezones.push('UTC')
  }

  const updateConfig = event => {
    event.preventDefault()
    const newTz = event.target.timezone.value
   
    // Only add if it's valid and not in the list
    if (newTz in tzdata.zones && timezones.indexOf(newTz) < 0) {
      timezones.push(event.target.timezone.value)
      router.push({
        pathname: '/',
        query: {
          ...query,
          timezones: timezones,
        }
      })
    }
  }

  const removeTimezone = (zone: string) => {
    router.push({
        pathname: '/',
        query: {
          ...query,
          timezones: timezones.filter(z => z != zone),
        }
      })
  }

  const hour = startHour
  const utc = DateTime.utc(date.year, date.month, date.day, hour, 0, 0)

  const cityRows = timezones.map( zone => {
    const rezoned = utc.setZone(zone)
    const hours = []
    for ( let hour = 0; hour < 24; hour++ ) {
      const timeSlice = rezoned.plus({ hours: hour })
      const curHour = timeSlice.toObject().hour
      const bg =
        curHour < 7 ?  'bg-indigo-200' :
        curHour < 9 ?  'bg-yellow-100' :
        curHour < 18 ? 'bg-green-100' :
        curHour < 22 ? 'bg-yellow-100' :
                       'bg-indigo-200'
      const format = timeSlice.toObject().minute === 0 ? timeSlice.toFormat('HH') : timeSlice.toFormat('HH:mm')
      hours.push(
        <td className={`px-1 whitespace-nowrap text-sm text-gray-500 ${bg}`} key={`tz-${zone}-${hour}`}>{format}</td>
      )
    }
    const label = rezoned.toFormat('ZZZZZ').indexOf('Daylight Time') >= 0 ?
      <DaylightIcon /> : ''
    return (
      <tr key={`tz-${zone}`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          <div className="flex items-center">

            <div className="flex-shrink-0 h-6 w-6">{label}</div>
            <div className="ml-4">{zone}</div>
          </div>
        </td>
        {hours}
        <td>
          <button onClick={() => removeTimezone(zone)} className="px-6 py-4 text-red-900">
            <RemoveIcon />
          </button>
        </td>
      </tr>
    )
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <Head>
        <title>What time is it?</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          What time is it on {date.toLocaleString()}?
        </h1>

        <p className="mt-3 text-2xl">
          A simple tool to help navigate time zones
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timezone
                </th>
                <th
                  colSpan={5}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Starting at {startHour}
                </th>
                <th
                  colSpan={20}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                </th>
              </tr>
            </thead>
            <tbody>
              {cityRows}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-around w-full mt-6 sm:w-full">
          <form
            className="space-y-8 divide-y divide-gray-200"
            onSubmit={updateConfig}
          >
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">

                  <label htmlFor="addTimezone" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Add timezone
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <select
                      id="addTimezone"
                      name="timezone"
                      autoComplete="timezone"
                      className="max-w-lg py-2 block focus:ring-indigo-500 focus:border-indigo-500 w-full sm:max-w-xs sm:text-sm ring-gray-500 border-gray-800 rounded-md"
                    >
                      {Object.keys(tzdata.zones).map(zone => <option key={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center px-1"
          href="https://github.com/jshirley/whattimeisit"
          target="_blank"
        >
          Patches welcome :)
        </a>
      </footer>
    </div>
  )
}
