import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import PropTypes from 'prop-types'

const MyChart = ({
  data,
  ethPrice
}) => {
  const [created, setCreated] = useState(false);
  var newSeries = useRef(null);
  const chartContainerRef = useRef();
  var chart = useRef(null);
  useEffect(() => {
    const chartOptions = {
      handleScale: {
        axisPressedMouseMove: true
      },
      width: chartContainerRef.current.width,
      height: chartContainerRef.current.height,
      layout: {
        backgroundColor: "#151515",
        textColor: "#aaaaaa"
      },
      grid: {
        vertLines: {
          color: "#f3cc2f"
        },
        horzLines: {
          color: "#f3cc2f"
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      priceScale: {
        borderColor: "#f3cc2f"
      },
      timeScale: {
        borderColor: "#f3cc2f",
        timeVisible: true,
        secondVisible: true,
      },

    };
    if (created === false) {
      chart.current = createChart(chartContainerRef.current, chartOptions);
      chart.current.timeScale().fitContent();
      newSeries.current = chart.current.addCandlestickSeries();
      newSeries.current.applyOptions({
        priceFormat: {
          type: 'price',
          precision: 9,
          minMove: 0.000000001,
        },
      })
      setCreated(true)
    }
  }, [created]);

  useEffect(() => {
    if (data) {
      let priceList;
      let tokenPriceDatas = [];
      for (let i = 0; i < data.length; i++) {
        let openPrice = Number(data[i].open) * ethPrice / (10 ** 12)
        let closePrice = Number(data[i].close) * ethPrice / (10 ** 12)
        let high = Math.max(openPrice, closePrice);
        let low = Math.min(openPrice, closePrice);
        priceList = { time: Number(data[i].time), open: openPrice, high: high, low, close: closePrice };
        tokenPriceDatas.push(priceList);
      }
      newSeries.current.setData(
        tokenPriceDatas
      );
    }
  }, [data]);

  return (
    <div className="chartTab_outer px-6">
      <div className="chartTab_container">
        <div
          ref={chartContainerRef}
          style={{
            width: "100%",
            height: "100%",
            border: 'solid #b04851 1px'
          }}
        ></div>
      </div>
    </div>
  )
}

MyChart.propTypes = {
  data: PropTypes.array.isRequired,
}

export default MyChart