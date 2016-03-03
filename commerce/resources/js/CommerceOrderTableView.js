/**
 * Class Craft.CommerceOrderTableView
 */
Craft.CommerceOrderTableView = Craft.TableElementIndexView.extend({

    startDate: null,
    endDate: null,

	$chartExplorer: null,

	afterInit: function()
    {
        this.$explorerContainer = $('<div class="chart-explorer-container"></div>').prependTo(this.$container);

        this.createChartExplorer();

		this.base();
	},

    getStorage: function(key)
    {
        return Craft.CommerceOrderTableView.getStorage(this.elementIndex._namespace, key);
    },

    setStorage: function(key, value)
    {
        Craft.CommerceOrderTableView.setStorage(this.elementIndex._namespace, key, value);
    },

    createChartExplorer: function()
    {
        // chart explorer
        var $chartExplorer = $('<div class="chart-explorer"></div>').appendTo(this.$explorerContainer),
            $chartHeader = $('<div class="chart-header"></div>').appendTo($chartExplorer),
            $dateRange = $('<div class="date-range" />').appendTo($chartHeader),
            $startDateContainer = $('<div class="datewrapper"></div>').appendTo($dateRange),
            $to = $('<span class="to light">to</span>').appendTo($dateRange),
            $endDateContainer = $('<div class="datewrapper"></div>').appendTo($dateRange),
            $total = $('<div class="total"></div>').appendTo($chartHeader),
            $totalLabel = $('<div class="total-label light">'+Craft.t('Total Revenue')+'</div>').appendTo($total),
            $totalValueWrapper = $('<div class="total-value-wrapper"></div>').appendTo($total);
            $totalValue = $('<span class="total-value">&nbsp;</span>').appendTo($totalValueWrapper);

        this.$chartExplorer = $chartExplorer;
        this.$totalValue = $totalValue;
        this.$chartContainer = $('<div class="chart-container"></div>').appendTo($chartExplorer);
        this.$spinner = $('<div class="spinner hidden" />').prependTo($chartHeader);
        this.$error = $('<div class="error"></div>').appendTo(this.$chartContainer);
        this.$chart = $('<div class="chart"></div>').appendTo(this.$chartContainer);

        this.$startDate = $('<input type="text" class="text" size="20" autocomplete="off" />').appendTo($startDateContainer);
        this.$endDate = $('<input type="text" class="text" size="20" autocomplete="off" />').appendTo($endDateContainer);

        this.$startDate.datepicker($.extend({
            onSelect: $.proxy(function(dateText, inst)
            {
                this.setStartDate(Craft.CommerceOrderTableView.getDateFromDatepickerInstance(inst));
                this.loadReport();
            }, this)
        }, Craft.datepickerOptions));

        this.$endDate.datepicker($.extend({
            onSelect: $.proxy(function(dateText, inst)
            {
                this.setEndDate(Craft.CommerceOrderTableView.getDateFromDatepickerInstance(inst));
                this.loadReport();
            }, this)
        }, Craft.datepickerOptions));

        // Set the start/end dates
        var startTime = this.getStorage('startTime') || ((new Date()).getTime() - (60 * 60 * 24 * 7 * 1000)),
            endTime = this.getStorage('endTime') || ((new Date()).getTime());

        this.setStartDate(new Date(startTime));
        this.setEndDate(new Date(endTime));

        this.loadReport();
    },

    setStartDate: function(date)
    {
        this.startDate = date;
        this.setStorage('startTime', this.startDate.getTime());
        this.$startDate.val(Craft.formatDate(this.startDate));

        // If this is after the current end date, set the end date to match it
        if (this.endDate && this.startDate.getTime() > this.endDate.getTime())
        {
            this.setEndDate(new Date(this.startDate.getTime()));
        }
    },

    setEndDate: function(date)
    {
        this.endDate = date;
        this.setStorage('endTime', this.endDate.getTime());
        this.$endDate.val(Craft.formatDate(this.endDate));

        // If this is before the current start date, set the start date to match it
        if (this.startDate && this.endDate.getTime() < this.startDate.getTime())
        {
            this.setStartDate(new Date(this.endDate.getTime()));
        }
    },

    loadReport: function()
    {
        var requestData = this.settings.params;

        requestData.startDate = Craft.CommerceOrderTableView.getDateValue(this.startDate);
        requestData.endDate = Craft.CommerceOrderTableView.getDateValue(this.endDate);

        this.$spinner.removeClass('hidden');
        this.$error.addClass('hidden');
        this.$chart.removeClass('error');


        Craft.postActionRequest('commerce/charts/getRevenueReport', requestData, $.proxy(function(response, textStatus)
        {
            this.$spinner.addClass('hidden');

            if(textStatus == 'success' && typeof(response.error) == 'undefined')
            {
                if(!this.chart)
                {
                    this.chart = new Craft.charts.Area(this.$chart);
                }

                var chartDataTable = new Craft.charts.DataTable(response.dataTable);

                var chartSettings = {
                    localeDefinition: response.localeDefinition,
                    orientation: response.orientation,
                    formats: response.formats,
                    dataScale: response.scale
                };

                this.chart.draw(chartDataTable, chartSettings);

                this.$totalValue.html(response.totalHtml);
            }
            else
            {
                var msg = 'An unknown error occured.';

                if(typeof(response) != 'undefined' && response && typeof(response.error) != 'undefined')
                {
                    msg = response.error;
                }

                this.$error.html(msg);
                this.$error.removeClass('hidden');
                this.$chart.addClass('error');
            }
        }, this));
    }
},
{
    storage: {},

    getStorage: function(namespace, key)
    {
        if (Craft.CommerceOrderTableView.storage[namespace] && Craft.CommerceOrderTableView.storage[namespace][key])
        {
            return Craft.CommerceOrderTableView.storage[namespace][key];
        }

        return null;
    },

    setStorage: function(namespace, key, value)
    {
        if (typeof Craft.CommerceOrderTableView.storage[namespace] == typeof undefined)
        {
            Craft.CommerceOrderTableView.storage[namespace] = {};
        }

        Craft.CommerceOrderTableView.storage[namespace][key] = value;
    },

    getDateFromDatepickerInstance: function(inst)
    {
        return new Date(inst.currentYear, inst.currentMonth, inst.currentDay);
    },

    getDateValue: function(date)
    {
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
    }
});