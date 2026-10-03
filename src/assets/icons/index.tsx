import back from './back.svg?raw';
import calendar from './calendar.svg?raw';
import chevronLeft from './chevron-left.svg?raw';
import chevronRight from './chevron-right.svg?raw';
import couch from './couch.svg?raw';
import dumbbell from './dumbbell.svg?raw';
import flash from './flash.svg?raw';
import gear from './gear.svg?raw';
import home from './home.svg?raw';
import pause from './pause.svg?raw';
import play from './play.svg?raw';
import plus from './plus.svg?raw';
import rotateCcw from './rotate-ccw.svg?raw';
import skip from './skip.svg?raw';
import user from './user.svg?raw';
import week from './week.svg?raw';

function SvgIcon({ svg }: { svg: string }) {
  return <span dangerouslySetInnerHTML={{ __html: svg }} style={{ display: 'contents' }} />;
}

export const IconBack = () => <SvgIcon svg={back} />;
export const IconCalendar = () => <SvgIcon svg={calendar} />;
export const IconChevronLeft = () => <SvgIcon svg={chevronLeft} />;
export const IconChevronRight = () => <SvgIcon svg={chevronRight} />;
export const IconCouch = () => <SvgIcon svg={couch} />;
export const IconDumbbell = () => <SvgIcon svg={dumbbell} />;
export const IconFlash = () => <SvgIcon svg={flash} />;
export const IconGear = () => <SvgIcon svg={gear} />;
export const IconHome = () => <SvgIcon svg={home} />;
export const IconPause = () => <SvgIcon svg={pause} />;
export const IconPlay = () => <SvgIcon svg={play} />;
export const IconPlus = () => <SvgIcon svg={plus} />;
export const IconRotateCcw = () => <SvgIcon svg={rotateCcw} />;
export const IconSkip = () => <SvgIcon svg={skip} />;
export const IconUser = () => <SvgIcon svg={user} />;
export const IconWeek = () => <SvgIcon svg={week} />;
