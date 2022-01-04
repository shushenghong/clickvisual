import highChartsStyles from '@/pages/DataLogs/components/HighCharts/index.less';
import { Chart, Tooltip, Interval, Interaction } from 'bizcharts';
import { Empty } from 'antd';
import classNames from 'classnames';
import { useModel } from '@@/plugin-model/useModel';
import { useRef, useState } from 'react';
import HighChartsTooltip from '@/pages/DataLogs/components/HighCharts/HighChartsTooltip';
import moment from 'moment';
import { ACTIVE_TIME_NOT_INDEX, TimeRangeType } from '@/config/config';
type HighChartsProps = {};
const HighCharts = (props: HighChartsProps) => {
  const {
    doGetLogs,
    onChangeStartDateTime,
    onChangeEndDateTime,
    onChangeActiveTimeOptionIndex,
    onChangeActiveTabKey,
    doGetHighCharts,
    isHiddenHighChart,
    highChartList,
    doParseQuery,
  } = useModel('dataLogs');
  const [highChartPosition, setHighChartPosition] = useState<'left' | 'right'>('left');
  const downTime = useRef<number>();
  const isSelectRange = useRef<boolean>(false);

  const format = (timeStr: string | number, formatType: string) => {
    return moment(timeStr, 'X').format(formatType);
  };

  const scale = {
    from: {
      type: 'timeCat',
      tickCount: 8,
      formatter: (text: string) => format(text, 'L'),
    },
    count: {
      type: 'pow',
      exponent: 1,
      tickCount: 1,
      min: 0,
      formatter: (text: string) =>
        parseInt(text) > 10000 ? `${parseInt(text) / 1000}k` : parseInt(text),
    },
  };

  const getChartDate = (view: any, x: number, y: number) => {
    const dataList = view.getSnapRecords({ x, y });
    if (dataList && dataList.length) {
      return dataList[0]._origin;
    }
    return undefined;
  };
  const onChangePosition = (x: number) => {
    if (x < 240) {
      setHighChartPosition('right');
    } else {
      setHighChartPosition('left');
    }
  };

  const onPlotMousemove = ({ x }: any) => {
    if (isSelectRange.current) return;
    onChangePosition(x);
  };

  const onPlotMousedown = ({ view, x, y }: any) => {
    isSelectRange.current = true;
    const data = getChartDate(view, x, y);
    if (!data) return;
    downTime.current = data.from;
  };

  const onMouseup = ({ view, x, y }: any) => {
    if (isSelectRange.current) {
      onChangePosition(x);
      isSelectRange.current = false;
    }
    const data = getChartDate(view, x, y);
    if (downTime.current && data) {
      const start = downTime.current < data.to ? downTime.current : data.to;
      const end = downTime.current < data.to ? data.to : downTime.current;
      onChangeStartDateTime(start);
      onChangeEndDateTime(end);
      doGetLogs({ st: start, et: end });
      doGetHighCharts({ st: start, et: end });
      onChangeActiveTimeOptionIndex(ACTIVE_TIME_NOT_INDEX);
      onChangeActiveTabKey(TimeRangeType.Custom);
      doParseQuery();
    }
  };

  return (
    <div
      className={classNames(
        isHiddenHighChart ? highChartsStyles.highCartMainHidden : highChartsStyles.highChartsMain,
      )}
    >
      <Chart
        autoFit
        scale={scale}
        height={100}
        data={highChartList}
        interactions={['active-region']}
        padding={'auto'}
        notCompareData={false}
        // errorContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无数据'} />}
        onPlotMousemove={onPlotMousemove}
        onPlotMousedown={onPlotMousedown}
        onMouseup={onMouseup}
        placeholder={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无查询数据'} />}
      >
        <Interval position="from*count" color={'hsla(219,100%,68%,.7)'} />
        <Tooltip
          domStyles={{ 'g2-tooltip': { background: 'hsla(0,0%,0%,.8)' } }}
          shared
          position={highChartPosition}
          showTitle={false}
          region={null}
          offset={20}
        >
          {(title, items) => {
            if (!items) return <></>;
            const data = items[0].data;
            return <HighChartsTooltip data={data} format={format} />;
          }}
        </Tooltip>
        <Interaction
          type={'brush-x'}
          config={{
            showEnable: [
              { trigger: 'plot:mouseenter', action: ['cursor:pointer'] },
              { trigger: 'plot:mouseleave', action: 'cursor:default' },
            ],
            start: [
              {
                trigger: 'plot:mousedown',
                action: ['x-rect-mask:start', 'rect-mask:show'],
              },
            ],
            processing: [
              {
                trigger: 'plot:mousemove',
                action: ['x-rect-mask:resize', 'cursor:crosshair'],
              },
              {
                trigger: 'plot:mouseleave',
                action: ['x-rect-mask:resize', 'tooltip:hide'],
              },
            ],
            end: [
              {
                trigger: 'mouseup',
                action: ['rect-mask:end', 'rect-mask:hide'],
              },
            ],
          }}
        />
      </Chart>
    </div>
  );
};

export default HighCharts;
