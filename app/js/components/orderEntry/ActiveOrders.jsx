import React from 'react';
import { connect } from 'react-redux';
import format from 'date-fns/format';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import { activeOrderAction } from '../../actions/activeOrderAction';
import { addDraftOrder } from '../../actions/draftTableAction';
import imageLoader from '../../../img/loading.gif';


export class ActiveOrders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draftOrder: {},
      pageCount: 0,
      limit: 10,
      startIndex: 0,
      pageNumber: 0,
    };
    this.onPageChange = this.onPageChange.bind(this);
  }
  componentDidMount() {
    this.fetchActiveOrders(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabName !== this.props.tabName) {
      this.fetchActiveOrders(nextProps);
    }
    this.setState({ pageCount: nextProps.pageCount });
  }

  onClickDiscontinue = (order) => {
    const {
      uuid,
      drug,
      dose,
      dosingUnit,
      frequency,
      route,
      duration,
      durationUnit,
      reason,
      drugInstructions,
      dispensingQuantity,
      dispensingUnit,
      orderNumber,
    } = order;

    this.setState({
      draftOrder: {
        uuid,
        drugName: drug.display,
        action: 'DISCONTINUE',
        dose,
        dosingUnit,
        frequency,
        route,
        duration,
        durationUnit,
        reason,
        drugInstructions,
        dispensingQuantity,
        dispensingUnit,
        orderNumber,
      },
    }, () => {
      this.props.onDelete(true);
      this.props.addDraftOrder(this.state.draftOrder);
    });
  }

  onPageChange({ selected }) {
    let { startIndex, pageNumber } = this.state;
    const { limit } = this.state;
    startIndex = Math.ceil(selected * limit);
    pageNumber = startIndex / limit;
    this.setState(() => ({ startIndex, pageNumber }));
    this.fetchActiveOrders(this.props, { limit, startIndex });
  }

  fetchActiveOrders(props, newState) {
    const { limit, startIndex = 0 } = newState || this.state;
    this.setState(() => ({ startIndex: 0 }));
    const { location, careSetting } = props;
    const query = new URLSearchParams(location.search);
    const patientUuid = query.get('patient');
    const caresettingUuid = careSetting.uuid;
    this.props.activeOrderAction(limit, startIndex, patientUuid, caresettingUuid);
  }

  showOrders = activeOrders => activeOrders
    .map((order) => {
      const {
        uuid,
        action,
        dateActivated,
        autoExpireDate,
        drug,
        dose,
        doseUnits,
        frequency,
        route,
        duration,
        durationUnits,
        dosingInstructions,
        quantity,
        quantityUnits,
        dosingType,
      } = order;

      let details;


      if (dosingType === 'org.openmrs.SimpleDosingInstructions') {
        details = (
          <td>

            {drug.display}:
            {` ${dose}`}
            {` ${doseUnits.display}`}
            {`, ${frequency.display}`}
            {`, ${route.display}`}
            {duration && `, for ${duration}`}
            {durationUnits && ` ${durationUnits.display} total`}
            {dosingInstructions && `, (${dosingInstructions})`}
            {(quantity && quantityUnits) && `, (Dispense: ${quantity} ${quantityUnits.display})`}

          </td>
        );
      } else {
        details = (
          <td>

            {drug.display}:
            {dosingInstructions && ` ${dosingInstructions}`}
            {(quantity && quantityUnits) && `, (Dispense: ${quantity} ${quantityUnits.display})`}

          </td>
        );
      }

      let showStatus;

      if (this.props.editOrderNumber === order.orderNumber) {
        showStatus = (
          <p> will REVISE </p>
        );
      } else if (this.props.isDelete) {
        showStatus = (
          <p> Will DISCONTINUE </p>
        );
      } else {
        showStatus = (
          <div>
            <a
              href="#"
              onClick={() => this.props.handleEditActiveDrugOrder(order)}
            > <i className="icon-edit" title="Edit" />
            </a>
            <a > <i
              className="icon-remove icon-color"
              title="Delete"
              id="delete"
              role="button"
              tabIndex="0"
              onKeyPress={this.handleKeyPress}
              onClick={() => this.onClickDiscontinue(order)} />
            </a>
          </div>
        );
      }

      return (
        <tr key={uuid} >
          <td>
            {format(dateActivated, 'MM-DD-YYYY HH:mm')} {autoExpireDate && (`- ${format(autoExpireDate, 'MM-DD-YYYY HH:mm')}`)}
          </td>
          {details}
          <td className="text-center action-padding" >
            {showStatus}
          </td>
        </tr>
      );
    })


  render() {
    const { activeOrders, loading } = this.props.drugOrder;

    if (!activeOrders || loading) {
      return (
        <div className="text-align-center">
          <img src={imageLoader} alt="loader" />
        </div>
      );
    } else if (activeOrders.length === 0) {
      return (
        <div>
          <p>No Active Orders</p>
        </div>
      );
    }
    return (
      <div>
        <table className="table bordered mw-958-px">
          <thead>
            <tr>
              <th className="w-145-px">Date</th>
              <th>Details</th>
              <th className="w-81-px">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.showOrders(activeOrders)}
          </tbody>
        </table>
        <div className="clear">
          <div className="float-left-padding">
            {this.props.showResultCount}
          </div>
          <div className="dataTables_paginate">
            <ReactPaginate
              pageCount={this.state.pageCount}
              pageRangeDisplayed={5}
              marginPagesDisplayed={3}
              previousLabel="Previous"
              nextLabel="Next"
              breakClassName="text-align-center"
              initialPage={0}
              containerClassName="react-paginate-container"
              pageLinkClassName="page-link"
              activeClassName="active-link"
              disabledClassName="active-link"
              nextLinkClassName="page-link"
              previousLinkClassName="page-link"
              onPageChange={this.onPageChange}
              forcePage={this.state.pageNumber}
              disableInitialCallback
            />
          </div>
        </div>
      </div>
    );
  }
}

ActiveOrders.defaultProps = {
  editOrderNumber: "",
  showResultCount: 'Showing 1 to 10 of 55 entries',
  pageCount: 0,

};


const mapStateToProps = ({ activeOrderReducer }) => ({
  drugOrder: activeOrderReducer,
  pageCount: activeOrderReducer.pageCount,
  showResultCount: activeOrderReducer.showResultCount,
});

const mapDispatchToProps = dispatch => ({
  activeOrderAction: (limit, startIndex, careSetting, patientUuid) =>
    dispatch(activeOrderAction(limit, startIndex, careSetting, patientUuid)),
  addDraftOrder: order =>
    dispatch(addDraftOrder(order)),
});

ActiveOrders.propTypes = {
  handleEditActiveDrugOrder: PropTypes.func.isRequired,
  tabName: PropTypes.string.isRequired,
  editOrderNumber: PropTypes.string,
  activeOrderAction: PropTypes.func.isRequired,
  addDraftOrder: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDelete: PropTypes.bool.isRequired,
  drugOrder: PropTypes.shape({
    loading: PropTypes.bool,
    activeOrders: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  showResultCount: PropTypes.string,
  pageCount: PropTypes.number,
};
export default connect(mapStateToProps, mapDispatchToProps)(ActiveOrders);
