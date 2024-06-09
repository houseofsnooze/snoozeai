import Ticker, { NewsTicker } from 'nice-react-ticker';

export default function NotificationTicker({ notification }: { notification: string }) {
    return (
    <div className="newsticker">
        <Ticker isNewsTicker={true} slideSpeed={40}>
          <NewsTicker id={1} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
          <NewsTicker id={2} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
          <NewsTicker id={3} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
          <NewsTicker id={4} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
          <NewsTicker id={5} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
          <NewsTicker id={6} title={notification} url="" meta={new Date().toLocaleDateString("en-US")} />
        </Ticker>
      </div>
    )
}